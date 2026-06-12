package com.studentbanking.common.dto;

import com.studentbanking.common.model.BankCode;

public record NpciRouteResponse(
        String sourceIdentifier,
        String destinationIdentifier,
        String senderAccountNumber,
        String receiverAccountNumber,
        BankCode senderBank,
        BankCode receiverBank,
        String routeType
) {
}
