package com.studentbanking.common.dto;

import java.math.BigDecimal;

public record AmountOperationResponse(
        String accountNumber,
        BigDecimal balance,
        String reference,
        String status
) {
}
