package com.studentbanking.notification.controller;

import com.studentbanking.notification.dto.CreateNotificationRequest;
import com.studentbanking.notification.dto.NotificationResponse;
import com.studentbanking.notification.service.NotificationQueryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationQueryService notificationQueryService;
    public NotificationController(NotificationQueryService notificationQueryService) { this.notificationQueryService = notificationQueryService; }

    @PostMapping
    public NotificationResponse create(@Valid @RequestBody CreateNotificationRequest request) {
        return notificationQueryService.create(request);
    }

    @GetMapping
    public List<NotificationResponse> list(@RequestParam("userId") Long userId) {
        return notificationQueryService.getNotifications(userId);
    }
}
