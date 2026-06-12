package com.studentbanking.notification.dto;

import java.time.Instant;

public record NotificationResponse(
        Long userId,
        String title,
        String message,
        Instant createdAt
) {
}
