package com.studentbanking.user.dto;

public record UserProfileResponse(
        Long id,
        Long authUserId,
        String fullName,
        String email,
        String phoneNumber
) {
}
