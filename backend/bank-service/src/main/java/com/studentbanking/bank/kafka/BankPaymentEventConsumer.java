package com.studentbanking.bank.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentbanking.bank.service.BankAccountService;
import com.studentbanking.common.dto.AmountOperationRequest;
import com.studentbanking.common.dto.PaymentWorkflowEvent;
import com.studentbanking.common.model.PaymentEventType;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class BankPaymentEventConsumer {

    private final ObjectMapper objectMapper;
    private final BankAccountService bankAccountService;
    private final BankPaymentEventProducer bankPaymentEventProducer;

    public BankPaymentEventConsumer(
            ObjectMapper objectMapper,
            BankAccountService bankAccountService,
            BankPaymentEventProducer bankPaymentEventProducer
    ) {
        this.objectMapper = objectMapper;
        this.bankAccountService = bankAccountService;
        this.bankPaymentEventProducer = bankPaymentEventProducer;
    }

    @KafkaListener(topics = "${app.kafka.topics.payment-events}", groupId = "bank-service")
    public void consumePaymentEvent(String payload) throws JsonProcessingException {
        PaymentWorkflowEvent event = objectMapper.readValue(payload, PaymentWorkflowEvent.class);
        switch (event.eventType()) {
            case DEBIT_REQUESTED -> handleDebitRequested(event);
            case CREDIT_REQUESTED -> handleCreditRequested(event);
            case REFUND_REQUESTED -> handleRefundRequested(event);
            default -> {
            }
        }
    }

    private void handleDebitRequested(PaymentWorkflowEvent event) {
        try {
            bankAccountService.debit(event.accountNumber(), new AmountOperationRequest(event.amount(), event.transactionId(), "Kafka debit request"));
            publish(event, PaymentEventType.DEBIT_COMPLETED, null);
        } catch (Exception exception) {
            publish(event, PaymentEventType.DEBIT_FAILED, exception.getMessage());
        }
    }

    private void handleCreditRequested(PaymentWorkflowEvent event) {
        try {
            bankAccountService.credit(event.accountNumber(), new AmountOperationRequest(event.amount(), event.transactionId(), "Kafka credit request"));
            publish(event, PaymentEventType.CREDIT_COMPLETED, null);
        } catch (Exception exception) {
            publish(event, PaymentEventType.CREDIT_FAILED, exception.getMessage());
        }
    }

    private void handleRefundRequested(PaymentWorkflowEvent event) {
        try {
            bankAccountService.credit(event.accountNumber(), new AmountOperationRequest(event.amount(), event.transactionId(), "Kafka refund request"));
            publish(event, PaymentEventType.REFUND_COMPLETED, event.reason());
        } catch (Exception exception) {
            publish(event, PaymentEventType.PAYMENT_FAILED, exception.getMessage());
        }
    }

    private void publish(PaymentWorkflowEvent source, PaymentEventType eventType, String reason) {
        bankPaymentEventProducer.publish(new PaymentWorkflowEvent(
                eventType,
                source.transactionType(),
                source.transactionId(),
                source.senderAccount(),
                source.receiverAccount(),
                source.accountNumber(),
                source.senderUserId(),
                source.receiverUserId(),
                source.senderBank(),
                source.receiverBank(),
                source.amount(),
                reason
        ));
    }
}
