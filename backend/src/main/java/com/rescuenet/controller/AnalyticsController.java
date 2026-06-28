package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.entity.ActivityLog;
import com.rescuenet.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics & Reports", description = "Endpoints for platform metrics, statistics, and audit activity logs")
@CrossOrigin
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/metrics")
    @Operation(summary = "Get system metrics", description = "Retrieve summary metrics like counts of active disasters, available volunteers, resources, and shelters.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics() {
        Map<String, Object> metrics = analyticsService.getSystemMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics, "System metrics compiled successfully"));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get administrative activity logs", description = "List system action audit trails. Restricted to admins.")
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getActivityLogs() {
        List<ActivityLog> logs = analyticsService.getAllActivityLogs();
        return ResponseEntity.ok(ApiResponse.success(logs, "Activity logs retrieved successfully"));
    }
}
