package com.studentbanking.bank.dto;

import com.studentbanking.common.model.BankCode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateBankAccountRequest(
        @NotNull Long userId,
        @NotNull BankCode bankCode,
        @NotBlank String accountHolderName,
        @NotNull @DecimalMin("0.0") BigDecimal openingBalance
) {
}
