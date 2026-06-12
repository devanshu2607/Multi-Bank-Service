package com.studentbanking.notification.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentbanking.common.dto.NotificationEvent;
import com.studentbanking.notification.dto.CreateNotificationRequest;
import com.studentbanking.notification.service.NotificationQueryService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationQueryService notificationQueryService;

    public NotificationEventConsumer(ObjectMapper objectMapper, NotificationQueryService notificationQueryService) {
        this.objectMapper = objectMapper;
        this.notificationQueryService = notificationQueryService;
    }

    @KafkaListener(topics = "${app.kafka.topics.notification-events}", groupId = "notification-service")
    public void consumeNotificationEvent(String payload) throws JsonProcessingException {
        NotificationEvent event = objectMapper.readValue(payload, NotificationEvent.class);
        if ("SUCCESS".equalsIgnoreCase(event.status())) {
            notificationQueryService.create(new CreateNotificationRequest(
                    event.senderUserId(),
                    "Money Debited",
                    "Payment " + event.transactionId() + " debited amount " + event.amount()
            ));
            notificationQueryService.create(new CreateNotificationRequest(
                    event.receiverUserId(),
                    "Money Credited",
                    "Payment " + event.transactionId() + " credited amount " + event.amount()
            ));
            return;
        }
        notificationQueryService.create(new CreateNotificationRequest(
                event.senderUserId(),
                "Payment Failed",
                "Payment " + event.transactionId() + " failed"
        ));
    }
}
