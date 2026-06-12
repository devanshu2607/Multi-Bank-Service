package com.studentbanking.ledger.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateLedgerEntryRequest(
        @NotBlank String accountNumber,
        @NotBlank String reference,
        @NotBlank String entryType,
        @NotNull @DecimalMin("0.0") BigDecimal amount,
        @NotNull BigDecimal balanceAfter
) {
}
