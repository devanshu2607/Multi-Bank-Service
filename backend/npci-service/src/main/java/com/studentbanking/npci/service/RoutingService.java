package com.studentbanking.npci.service;

import com.studentbanking.common.dto.AccountDetailsResponse;
import com.studentbanking.common.dto.PaymentWorkflowEvent;
import com.studentbanking.common.dto.UpiResolutionResponse;
import com.studentbanking.common.exception.ApiException;
import com.studentbanking.common.model.PaymentEventType;
import com.studentbanking.common.model.TransactionType;
import com.studentbanking.npci.dto.RouteRequest;
import com.studentbanking.npci.dto.RouteResponse;
import com.studentbanking.npci.entity.RouteMapping;
import com.studentbanking.npci.kafka.NpciPaymentEventProducer;
import com.studentbanking.npci.repository.RouteMappingRepository;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class RoutingService {

    private final RouteMappingRepository routeMappingRepository;
    private final NpciPaymentEventProducer npciPaymentEventProducer;
    private final RestClient upiRestClient;
    private final RestClient bankRestClient;

    public RoutingService(
            RouteMappingRepository routeMappingRepository,
            NpciPaymentEventProducer npciPaymentEventProducer,
            @Value("${services.upi-service.url}") String upiServiceUrl,
            @Value("${services.bank-service.url:http://bank-service:8083}") String bankServiceUrl
    ) {
        this.routeMappingRepository = routeMappingRepository;
        this.npciPaymentEventProducer = npciPaymentEventProducer;
        this.upiRestClient = RestClient.builder().baseUrl(upiServiceUrl).build();   
        this.bankRestClient = RestClient.builder().baseUrl(bankServiceUrl).build();
    }

    public RouteResponse resolve(RouteRequest request) {
        UpiResolutionResponse source = resolveIdentifier(request.sourceIdentifier(), request.routeType());
        UpiResolutionResponse destination = resolveIdentifier(request.targetIdentifier(), request.routeType());

        routeMappingRepository.findBySourceIdentifierAndTargetIdentifierAndRouteType(
                request.sourceIdentifier(),
                request.targetIdentifier(),
                request.routeType() 
        ).orElseGet(() -> {
            RouteMapping mapping = new RouteMapping();
            mapping.setSourceIdentifier(request.sourceIdentifier());
            mapping.setTargetIdentifier(request.targetIdentifier());
            mapping.setRouteType(request.routeType());
            return routeMappingRepository.save(mapping);
        });

        return new RouteResponse(
                null,
                request.sourceIdentifier(),
                request.targetIdentifier(),
                source.defaultAccountNumber(),
                destination.defaultAccountNumber(),
                source.userId(),
                destination.userId(),
                source.bankCode(),
                destination.bankCode(),
                "NPCI resolved " + request.routeType() + " transfer"
        );
    }

    public RouteResponse resolveAndPublish(RouteRequest request, BigDecimal amount) {
        RouteResponse route = resolve(request);
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        npciPaymentEventProducer.publish(new PaymentWorkflowEvent(
                PaymentEventType.PAYMENT_REQUESTED,
                TransactionType.valueOf(request.routeType().toUpperCase()),
                transactionId,
                route.senderAccountNumber(),
                route.receiverAccountNumber(),
                null,
                route.senderUserId(),
                route.receiverUserId(),
                route.senderBank(),
                route.receiverBank(),
                amount,
                null
        ));
        return new RouteResponse(
                transactionId,
                route.sourceIdentifier(),
                route.targetIdentifier(),
                route.senderAccountNumber(),
                route.receiverAccountNumber(),
                route.senderUserId(),
                route.receiverUserId(),
                route.senderBank(),
                route.receiverBank(),
                route.routingHint()
        );
    }

    private UpiResolutionResponse resolveIdentifier(String identifier, String routeType) {
        if ("PHONE".equalsIgnoreCase(routeType)) {
            return upiRestClient.get()
                    .uri("/api/upi/resolve/phone/{phoneNumber}", identifier)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(UpiResolutionResponse.class);
        }
        if ("UPI".equalsIgnoreCase(routeType)) {
            return upiRestClient.get()
                    .uri("/api/upi/resolve/upi/{upiId}", identifier)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(UpiResolutionResponse.class);
        }
        if ("OWN_ACCOUNT".equalsIgnoreCase(routeType) || "INTER_BANK".equalsIgnoreCase(routeType)) {
            AccountDetailsResponse account = bankRestClient.get()
                    .uri("/api/accounts/{accountNumber}", identifier)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(AccountDetailsResponse.class);
            if (account == null) {
                throw new ApiException("Account not found: " + identifier);
            }
            return new UpiResolutionResponse(
                    account.userId(),
                    null,
                    null,
                    account.accountNumber(),
                    account.bankCode(),
                    account.accountHolderName()
            );
        }
        throw new ApiException("Unsupported route type: " + routeType);
    }
}
