package com.studentbanking.bank.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentbanking.common.dto.PaymentWorkflowEvent;
import com.studentbanking.common.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class BankPaymentEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String paymentEventsTopic;

    public BankPaymentEventProducer(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper,
            @Value("${app.kafka.topics.payment-events}") String paymentEventsTopic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.paymentEventsTopic = paymentEventsTopic;
    }

    public void publish(PaymentWorkflowEvent event) {
        kafkaTemplate.send(paymentEventsTopic, event.transactionId(), serialize(event));
    }

    private String serialize(PaymentWorkflowEvent event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException exception) {
            throw new ApiException("Unable to serialize bank payment event");
        }
    }
}
