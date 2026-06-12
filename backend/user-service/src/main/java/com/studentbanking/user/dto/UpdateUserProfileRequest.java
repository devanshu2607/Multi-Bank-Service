package com.studentbanking.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserProfileRequest(
        @NotBlank String fullName,
        @Email String email,
        @Pattern(regexp = "^[0-9]{10}$") String phoneNumber
) {
}
