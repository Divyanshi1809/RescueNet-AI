package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.entity.User;
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
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints to fetch user listings, current logged-in user profile, and user status toggling")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "List all registered accounts. Restricted to admin users.")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Retrieve profile details for the currently logged-in user session.")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(currentUser, "Profile details retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve specific user profile information by user identifier.")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User details retrieved successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user active status", description = "Toggle active state flag for user. Restricted to admin users.")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        User user = userService.updateUserStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success(user, "User status updated successfully"));
    }
}
