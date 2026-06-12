package com.studentbanking.notification.service;

import com.studentbanking.notification.dto.CreateNotificationRequest;
import com.studentbanking.notification.dto.NotificationResponse;
import com.studentbanking.notification.entity.NotificationMessage;
import com.studentbanking.notification.repository.NotificationRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationQueryService {

    private final NotificationRepository notificationRepository;

    public NotificationQueryService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public NotificationResponse create(CreateNotificationRequest request) {
        NotificationMessage message = new NotificationMessage();
        message.setUserId(request.userId());
        message.setTitle(request.title());
        message.setMessage(request.message());
        return map(notificationRepository.save(message));
    }

    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::map)
                .toList();
    }

    private NotificationResponse map(NotificationMessage message) {
        return new NotificationResponse(
                message.getUserId(),
                message.getTitle(),
                message.getMessage(),
                message.getCreatedAt()
        );
    }
}
