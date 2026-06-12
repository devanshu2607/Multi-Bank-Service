package com.studentbanking.upi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateUpiProfileRequest(
        @NotNull Long userId,
        @NotBlank String handle,
        @Pattern(regexp = "^[0-9]{10}$") String phoneNumber,
        @NotBlank String defaultAccountNumber
) {
}
