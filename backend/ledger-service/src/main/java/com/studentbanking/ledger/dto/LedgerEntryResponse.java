package com.studentbanking.ledger.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record LedgerEntryResponse(
        String accountNumber,
        String reference,
        String entryType,
        BigDecimal amount,
        BigDecimal balanceAfter,
        Instant createdAt
) {
}
