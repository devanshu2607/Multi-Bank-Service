package com.studentbanking.common.dto;

import java.time.Instant;

public record ApiResponse(
        Instant timestamp,
        String service,
        String message,
        Object data
) {
}
