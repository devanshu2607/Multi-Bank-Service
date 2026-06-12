package com.studentbanking.payment.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentbanking.common.dto.LedgerEvent;
import com.studentbanking.common.dto.NotificationEvent;
import com.studentbanking.common.dto.PaymentWorkflowEvent;
import com.studentbanking.common.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String paymentEventsTopic;
    private final String ledgerEventsTopic;
    private final String notificationEventsTopic;

    public PaymentEventProducer(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            @Value("${app.kafka.topics.payment-events}") String paymentEventsTopic,
            @Value("${app.kafka.topics.ledger-events}") String ledgerEventsTopic,
            @Value("${app.kafka.topics.notification-events}") String notificationEventsTopic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.paymentEventsTopic = paymentEventsTopic;
        this.ledgerEventsTopic = ledgerEventsTopic;
        this.notificationEventsTopic = notificationEventsTopic;
    }

    public void publishPaymentEvent(PaymentWorkflowEvent event) {
        kafkaTemplate.send(paymentEventsTopic, event.transactionId(), serialize(event));
    }

    public void publishLedgerEvent(LedgerEvent event) {
        kafkaTemplate.send(ledgerEventsTopic, event.transactionId(), serialize(event));
    }

    public void publishNotificationEvent(NotificationEvent event) {
        kafkaTemplate.send(notificationEventsTopic, event.transactionId(), serialize(event));
    }

    private String serialize(Object event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException exception) {
            throw new ApiException("Unable to serialize Kafka event");
        }
    }
}
