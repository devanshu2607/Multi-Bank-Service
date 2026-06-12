package com.studentbanking.common.dto;

import java.math.BigDecimal;

public record LedgerEvent(
        String transactionId,
        String senderAccount,
        String receiverAccount,
        BigDecimal amount,
        String status
) {
}
