package com.studentbanking.bank.dto;

import com.studentbanking.common.model.BankCode;
import java.math.BigDecimal;

public record BankAccountResponse(
        String accountNumber,
        Long userId,
        String accountHolderName,
        BankCode bankCode,
        BigDecimal balance,
        String status
) {
}
