package com.studentbanking.payment.dto;

import com.studentbanking.common.model.TransactionStatus;
import com.studentbanking.common.model.TransactionType;
import java.math.BigDecimal;

public record PaymentResponse(
        String reference,
        TransactionStatus status,
        TransactionType type,
        BigDecimal amount,
        String senderAccountNumber,
        String receiverAccountNumber,
        String sagaStep
) {
}
