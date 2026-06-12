package com.studentbanking.payment.dto;

import com.studentbanking.common.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PaymentRequest(
        @NotBlank String sourceIdentifier,
        @NotBlank String destinationIdentifier,
        @NotNull @DecimalMin("1.0") BigDecimal amount,
        @NotNull TransactionType type,
        String narration
) {
}
