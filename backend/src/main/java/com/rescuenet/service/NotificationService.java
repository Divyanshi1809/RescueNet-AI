package com.rescuenet.service;

import com.rescuenet.entity.Notification;
import com.rescuenet.entity.User;
import com.rescuenet.exception.ResourceNotFoundException;
import com.rescuenet.repository.NotificationRepository;
import com.rescuenet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Notification sendNotification(Long recipientId, String message, String type) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found: " + recipientId));

        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .sentAt(LocalDateTime.now())
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderBySentAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdAndIsReadOrderBySentAtDesc(userId, false);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
