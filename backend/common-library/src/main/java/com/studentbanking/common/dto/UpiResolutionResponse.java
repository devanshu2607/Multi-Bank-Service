package com.studentbanking.common.dto;

import com.studentbanking.common.model.BankCode;

public record UpiResolutionResponse(
        Long userId,
        String upiId,
        String phoneNumber,
        String defaultAccountNumber,
        BankCode bankCode,
        String accountHolderName
) {
}
