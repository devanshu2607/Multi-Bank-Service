package com.studentbanking.auth.dto;

public record AuthResponse(
        Long userId,
        String email,
        String accessToken,
        String refreshToken,
        String message
) {
}
