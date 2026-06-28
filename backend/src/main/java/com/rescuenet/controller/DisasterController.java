package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.dto.DisasterRequest;
import com.rescuenet.entity.DisasterReport;
import com.rescuenet.service.DisasterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disasters")
@Tag(name = "Disaster Reports", description = "Endpoints to report, search, and change statuses of disasters")
@CrossOrigin
public class DisasterController {

    @Autowired
    private DisasterService disasterService;

    @PostMapping
    @Operation(summary = "Report a new disaster", description = "Report coordinates, severity, and description of a disaster.")
    public ResponseEntity<ApiResponse<DisasterReport>> reportDisaster(
            @Valid @RequestBody DisasterRequest request, Authentication authentication) {
        String username = authentication.getName();
        DisasterReport report = disasterService.createReport(request, username);
        return ResponseEntity.ok(ApiResponse.success(report, "Disaster report submitted successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all disaster reports", description = "Retrieve list of all reports recorded in the system.")
    public ResponseEntity<ApiResponse<List<DisasterReport>>> getAllDisasterReports() {
        List<DisasterReport> reports = disasterService.getAllReports();
        return ResponseEntity.ok(ApiResponse.success(reports, "Disaster reports retrieved successfully"));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Filter reports by status", description = "Retrieve disaster reports matching specific status (e.g. PENDING, ACTIVE, RESOLVED).")
    public ResponseEntity<ApiResponse<List<DisasterReport>>> getReportsByStatus(@PathVariable String status) {
        List<DisasterReport> reports = disasterService.getReportsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(reports, "Filtered reports retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get disaster report details", description = "Fetch report information by disaster report ID.")
    public ResponseEntity<ApiResponse<DisasterReport>> getReportById(@PathVariable Long id) {
        DisasterReport report = disasterService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.success(report, "Report details retrieved successfully"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update report status", description = "Update severity/resolution status of a reported disaster.")
    public ResponseEntity<ApiResponse<DisasterReport>> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        DisasterReport report = disasterService.updateReportStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(report, "Report status updated successfully"));
    }

    @PutMapping("/{id}/severity")
    @Operation(summary = "Update report severity", description = "Modify severity classification of the disaster.")
    public ResponseEntity<ApiResponse<DisasterReport>> updateSeverity(
            @PathVariable Long id, @RequestParam String severity) {
        DisasterReport report = disasterService.updateReportSeverity(id, severity);
        return ResponseEntity.ok(ApiResponse.success(report, "Report severity updated successfully"));
    }
}
