package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.dto.LoginRequest;
import com.rescuenet.dto.RegisterRequest;
import com.rescuenet.entity.User;
import com.rescuenet.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration and JWT login")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a user account with a given username, email, phone, password and role.")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        User registeredUser = authService.registerUser(registerRequest);
        return ResponseEntity.ok(ApiResponse.success(registeredUser, "User registered successfully"));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Validate user credentials and return a Bearer JWT Token.")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@Valid @RequestBody LoginRequest loginRequest) {
        String token = authService.authenticateUser(loginRequest);
        Map<String, String> responseData = new HashMap<>();
        responseData.put("token", token);
        return ResponseEntity.ok(ApiResponse.success(responseData, "Login successful"));
    }
}
