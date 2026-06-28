package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.entity.Notification;
import com.rescuenet.entity.User;
import com.rescuenet.service.NotificationService;
import com.rescuenet.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints to view and read notifications or dispatch new alerts")
@CrossOrigin
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Send notification alert", description = "Dispatch an alert message to a specific user. Restricted to admin accounts.")
    public ResponseEntity<ApiResponse<Notification>> sendNotification(
            @RequestParam Long recipientId, @RequestParam String message, @RequestParam String type) {
        Notification notification = notificationService.sendNotification(recipientId, message, type);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification sent successfully"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get user alerts", description = "Retrieve list of all alerts sent to current authenticated user.")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username);
        List<Notification> notifications = notificationService.getNotificationsForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications, "Alert notifications retrieved successfully"));
    }

    @GetMapping("/my/unread")
    @Operation(summary = "Get unread alerts", description = "Retrieve lists of unread alerts sent to current authenticated user.")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyUnreadNotifications(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username);
        List<Notification> notifications = notificationService.getUnreadNotificationsForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications, "Unread alert notifications retrieved successfully"));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark alert as read", description = "Mark alert status to read.")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable Long id) {
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(notification, "Alert marked as read successfully"));
    }
}
