package com.studentbanking.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateUserProfileRequest(
        @NotNull Long authUserId,
        @NotBlank String fullName,
        @Email String email,
        @Pattern(regexp = "^[0-9]{10}$") String phoneNumber
) {
}
