package com.studentbanking.notification.repository;

import com.studentbanking.notification.entity.NotificationMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<NotificationMessage, Long> {
    List<NotificationMessage> findByUserIdOrderByCreatedAtDesc(Long userId);
}
