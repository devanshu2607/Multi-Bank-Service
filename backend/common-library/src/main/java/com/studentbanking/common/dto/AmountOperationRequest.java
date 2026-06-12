package com.studentbanking.common.dto;

import java.math.BigDecimal;

public record AmountOperationRequest(
        BigDecimal amount,
        String reference,
        String remarks
) {
}
