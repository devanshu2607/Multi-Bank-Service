package com.studentbanking.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank String fullName,
        @Email String email,
        @Pattern(regexp = "^[0-9]{10}$") String phoneNumber,
        @NotBlank String password
) {
}
