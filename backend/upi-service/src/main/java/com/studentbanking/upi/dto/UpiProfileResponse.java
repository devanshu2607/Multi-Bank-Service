package com.studentbanking.upi.dto;

import com.studentbanking.common.model.BankCode;

public record UpiProfileResponse(
        Long userId,
        String upiId,
        String phoneNumber,
        String defaultAccountNumber,
        BankCode bankCode,
        String accountHolderName
) {
}
