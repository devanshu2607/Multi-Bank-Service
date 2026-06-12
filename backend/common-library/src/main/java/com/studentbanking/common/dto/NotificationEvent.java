package com.studentbanking.common.dto;

import java.math.BigDecimal;

public record NotificationEvent(
        String transactionId,
        Long senderUserId,
        Long receiverUserId,
        BigDecimal amount,
        String status
) {
}
