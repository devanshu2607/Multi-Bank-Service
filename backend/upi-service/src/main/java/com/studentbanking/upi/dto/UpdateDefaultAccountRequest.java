package com.studentbanking.upi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateDefaultAccountRequest(
        @NotNull Long userId,
        @NotBlank String defaultAccountNumber
) {
}
