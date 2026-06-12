package com.studentbanking.common.dto;

import com.studentbanking.common.model.BankCode;
import java.math.BigDecimal;

public record AccountDetailsResponse(
        String accountNumber,
        Long userId,
        String accountHolderName,
        BankCode bankCode,
        BigDecimal balance,
        String status
) {
}
