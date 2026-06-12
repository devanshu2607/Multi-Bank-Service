package com.studentbanking.payment.service;

import com.studentbanking.common.dto.LedgerEvent;
import com.studentbanking.common.dto.NotificationEvent;
import com.studentbanking.common.dto.PaymentWorkflowEvent;
import com.studentbanking.common.exception.ApiException;
import com.studentbanking.common.model.PaymentEventType;
import com.studentbanking.common.model.TransactionStatus;
import com.studentbanking.payment.dto.NpciRouteRequest;
import com.studentbanking.payment.dto.NpciRouteResponse;
import com.studentbanking.payment.dto.PaymentRequest;
import com.studentbanking.payment.dto.PaymentResponse;
import com.studentbanking.payment.entity.PaymentTransaction;
import com.studentbanking.payment.kafka.PaymentEventProducer;
import com.studentbanking.payment.repository.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
public class PaymentOrchestratorService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentEventProducer paymentEventProducer;
    private final RestClient npciClient;

    public PaymentOrchestratorService(
            PaymentTransactionRepository paymentTransactionRepository,
            PaymentEventProducer paymentEventProducer,
            @Value("${services.npci-service.url}") String npciServiceUrl
    ) {
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.paymentEventProducer = paymentEventProducer;
        this.npciClient = RestClient.builder().baseUrl(npciServiceUrl).build();
    }

    public PaymentResponse process(PaymentRequest request) {
        NpciRouteResponse route = npciClient.post()
                .uri(uriBuilder -> uriBuilder.path("/api/npci/payments").queryParam("amount", request.amount()).build())
                .body(new NpciRouteRequest(request.sourceIdentifier(), request.destinationIdentifier(), request.type().name()))
                .retrieve()
                .body(NpciRouteResponse.class);

        return new PaymentResponse(
                route == null ? "PENDING_NPCI_ROUTE" : route.transactionId(),
                TransactionStatus.PENDING,
                request.type(),
                request.amount(),
                route == null ? null : route.senderAccountNumber(),
                route == null ? null : route.receiverAccountNumber(),
                "NPCI will publish PAYMENT_REQUESTED to Kafka"
        );
    }

    @Transactional
    public void handleWorkflowEvent(PaymentWorkflowEvent event) {
        switch (event.eventType()) {
            case PAYMENT_REQUESTED -> handlePaymentRequested(event);
            case DEBIT_COMPLETED -> handleDebitCompleted(event);
            case DEBIT_FAILED -> handleDebitFailed(event);
            case CREDIT_COMPLETED -> handleCreditCompleted(event);
            case CREDIT_FAILED -> handleCreditFailed(event);
            case REFUND_COMPLETED -> handleRefundCompleted(event);
            case PAYMENT_FAILED -> handleExternalPaymentFailed(event);
            default -> {
            }
        }
    }

    private void handlePaymentRequested(PaymentWorkflowEvent event) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setReference(event.transactionId());
        transaction.setSenderAccountNumber(event.senderAccount());
        transaction.setReceiverAccountNumber(event.receiverAccount());
        transaction.setSenderUserId(event.senderUserId());
        transaction.setReceiverUserId(event.receiverUserId());
        transaction.setSenderBank(event.senderBank());
        transaction.setReceiverBank(event.receiverBank());
        transaction.setAmount(event.amount());
        transaction.setType(event.transactionType());
        transaction.setStatus(TransactionStatus.PENDING);
        paymentTransactionRepository.save(transaction);

        paymentEventProducer.publishPaymentEvent(new PaymentWorkflowEvent(
                PaymentEventType.DEBIT_REQUESTED,
                event.transactionType(),
                event.transactionId(),
                event.senderAccount(),
                event.receiverAccount(),
                event.senderAccount(),
                event.senderUserId(),
                event.receiverUserId(),
                event.senderBank(),
                event.receiverBank(),
                event.amount(),
                null
        ));
    }

    private void handleDebitCompleted(PaymentWorkflowEvent event) {
        PaymentTransaction transaction = load(event.transactionId());
        paymentEventProducer.publishPaymentEvent(new PaymentWorkflowEvent(
                PaymentEventType.CREDIT_REQUESTED,
                transaction.getType(),
                event.transactionId(),
                transaction.getSenderAccountNumber(),
                transaction.getReceiverAccountNumber(),
                transaction.getReceiverAccountNumber(),
                transaction.getSenderUserId(),
                transaction.getReceiverUserId(),
                transaction.getSenderBank(),
                transaction.getReceiverBank(),
                transaction.getAmount(),
                null
        ));
    }

    private void handleDebitFailed(PaymentWorkflowEvent event) {
        PaymentTransaction transaction = load(event.transactionId());
        transaction.setStatus(TransactionStatus.FAILED);
        paymentTransactionRepository.save(transaction);
        publishFailed(transaction, event.reason());
    }

    private void handleCreditCompleted(PaymentWorkflowEvent event) {
        PaymentTransaction transaction = load(event.transactionId());
        transaction.setStatus(TransactionStatus.SUCCESS);
        paymentTransactionRepository.save(transaction);

        paymentEventProducer.publishPaymentEvent(new PaymentWorkflowEvent(
                PaymentEventType.PAYMENT_COMPLETED,
                transaction.getType(),
                transaction.getReference(),
                transaction.getSenderAccountNumber(),
                transaction.getReceiverAccountNumber(),
                null,
                transaction.getSenderUserId(),
                transaction.getReceiverUserId(),
                transaction.getSenderBank(),
                transaction.getReceiverBank(),
                transaction.getAmount(),
                null
        ));
        paymentEventProducer.publishLedgerEvent(new LedgerEvent(
                transaction.getReference(),
                transaction.getSenderAccountNumber(),
                transaction.getReceiverAccountNumber(),
                transaction.getAmount(),
                "SUCCESS"
        ));
        paymentEventProducer.publishNotificationEvent(new NotificationEvent(
                transaction.getReference(),
                transaction.getSenderUserId(),
                transaction.getReceiverUserId(),
                transaction.getAmount(),
                "SUCCESS"
        ));
    }

    private void handleCreditFailed(PaymentWorkflowEvent event) {
        PaymentTransaction transaction = load(event.transactionId());
        paymentEventProducer.publishPaymentEvent(new PaymentWorkflowEvent(
                PaymentEventType.REFUND_REQUESTED,
                transaction.getType(),
                transaction.getReference(),
                transaction.getSenderAccountNumber(),
                transaction.getReceiverAccountNumber(),
                transaction.getSenderAccountNumber(),
                transaction.getSenderUserId(),
                transaction.getReceiverUserId(),
                transaction.getSenderBank(),
                transaction.getReceiverBank(),
                transaction.getAmount(),
                event.reason()
        ));
    }

    private void handleRefundCompleted(PaymentWorkflowEvent event) {
        PaymentTransaction transaction = load(event.transactionId());
        transaction.setStatus(TransactionStatus.FAILED);
        paymentTransactionRepository.save(transaction);

        paymentEventProducer.publishPaymentEvent(new PaymentWorkflowEvent(
                PaymentEventType.PAYMENT_FAILED,
                transaction.getType(),
                transaction.getReference(),
                transaction.getSenderAccountNumber(),
                transaction.getReceiverAccountNumber(),
                null,
                transaction.getSenderUserId(),
                transaction.getReceiverUserId(),
                transaction.getSenderBank(),
                transaction.getReceiverBank(),
                transaction.getAmount(),
                event.reason()
        ));
        publishFailed(transaction, event.reason());
    }

    private void handleExternalPaymentFailed(PaymentWorkflowEvent event) {
        PaymentTransaction transaction = load(event.transactionId());
        transaction.setStatus(TransactionStatus.FAILED);
        paymentTransactionRepository.save(transaction);
        publishFailed(transaction, event.reason());
    }

    private void publishFailed(PaymentTransaction transaction, String reason) {
        paymentEventProducer.publishNotificationEvent(new NotificationEvent(
                transaction.getReference(),
                transaction.getSenderUserId(),
                transaction.getReceiverUserId(),
                transaction.getAmount(),
                "FAILED: " + reason
        ));
    }

    private PaymentTransaction load(String transactionId) {
        return paymentTransactionRepository.findByReference(transactionId)
                .orElseThrow(() -> new ApiException("Transaction not found: " + transactionId));
    }
}
