package com.studentbanking.payment.dto;

import com.studentbanking.common.model.BankCode;

public record NpciRouteResponse(
        String transactionId,
        String sourceIdentifier,
        String targetIdentifier,
        String senderAccountNumber,
        String receiverAccountNumber,
        Long senderUserId,
        Long receiverUserId,
        BankCode senderBank,
        BankCode receiverBank,
        String routingHint
) {
}
