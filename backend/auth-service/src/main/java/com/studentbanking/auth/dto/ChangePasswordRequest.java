package com.studentbanking.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
        @Email String email,
        @NotBlank String currentPassword,
        @NotBlank String newPassword
) {
}
