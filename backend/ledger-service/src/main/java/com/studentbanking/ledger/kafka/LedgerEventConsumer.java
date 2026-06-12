package com.studentbanking.ledger.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentbanking.common.dto.LedgerEvent;
import com.studentbanking.ledger.dto.CreateLedgerEntryRequest;
import com.studentbanking.ledger.service.LedgerQueryService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class LedgerEventConsumer {

    private final ObjectMapper objectMapper;
    private final LedgerQueryService ledgerQueryService;

    public LedgerEventConsumer(ObjectMapper objectMapper, LedgerQueryService ledgerQueryService) {
        this.objectMapper = objectMapper;
        this.ledgerQueryService = ledgerQueryService;
    }

    @KafkaListener(topics = "${app.kafka.topics.ledger-events}", groupId = "ledger-service")
    public void consumeLedgerEvent(String payload) throws JsonProcessingException {
        LedgerEvent event = objectMapper.readValue(payload, LedgerEvent.class);
        ledgerQueryService.create(new CreateLedgerEntryRequest(
                event.senderAccount(),
                event.transactionId(),
                "DEBIT",
                event.amount(),
                event.amount()
        ));
        ledgerQueryService.create(new CreateLedgerEntryRequest(
                event.receiverAccount(),
                event.transactionId(),
                "CREDIT",
                event.amount(),
                event.amount()
        ));
    }
}
