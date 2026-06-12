package com.studentbanking.common.dto;

import com.studentbanking.common.model.BankCode;
import com.studentbanking.common.model.PaymentEventType;
import com.studentbanking.common.model.TransactionType;
import java.math.BigDecimal;

public record PaymentWorkflowEvent(
        PaymentEventType eventType,
        TransactionType transactionType,
        String transactionId,
        String senderAccount,
        String receiverAccount,
        String accountNumber,
        Long senderUserId,
        Long receiverUserId,
        BankCode senderBank,
        BankCode receiverBank,
        BigDecimal amount,
        String reason
) {
}
