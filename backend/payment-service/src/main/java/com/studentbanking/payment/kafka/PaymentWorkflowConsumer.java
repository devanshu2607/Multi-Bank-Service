package com.studentbanking.payment.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentbanking.common.dto.PaymentWorkflowEvent;
import com.studentbanking.payment.service.PaymentOrchestratorService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentWorkflowConsumer {

    private final ObjectMapper objectMapper;
    private final PaymentOrchestratorService paymentOrchestratorService;

    public PaymentWorkflowConsumer(ObjectMapper objectMapper, PaymentOrchestratorService paymentOrchestratorService) {
        this.objectMapper = objectMapper;
        this.paymentOrchestratorService = paymentOrchestratorService;
    }

    @KafkaListener(topics = "${app.kafka.topics.payment-events}", groupId = "payment-service")
    public void consumePaymentWorkflowEvent(String payload) throws JsonProcessingException {
        PaymentWorkflowEvent event = objectMapper.readValue(payload, PaymentWorkflowEvent.class);
        paymentOrchestratorService.handleWorkflowEvent(event);
    }
}
