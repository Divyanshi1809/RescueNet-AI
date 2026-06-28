package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.entity.Volunteer;
import com.rescuenet.service.VolunteerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Volunteer profile operations.
 * Emergency request endpoints have been moved to /api/emergency (EmergencyController).
 */
@RestController
@RequestMapping("/api/volunteers")
@Tag(name = "Volunteer Operations", description = "Endpoints for volunteer profiles, listings, and availability management.")
@CrossOrigin
public class VolunteerController {

    @Autowired
    private VolunteerService volunteerService;

    @PostMapping("/register")
    @Operation(
            summary = "Register as a volunteer",
            description = "Create a volunteer profile for the currently logged-in user."
    )
    public ResponseEntity<ApiResponse<Volunteer>> registerVolunteer(
            @RequestParam String skills, Authentication authentication) {
        String username = authentication.getName();
        Volunteer volunteer = volunteerService.registerVolunteer(username, skills);
        return ResponseEntity.ok(ApiResponse.success(volunteer, "Registered as volunteer successfully"));
    }

    @GetMapping
    @Operation(
            summary = "Get all volunteers",
            description = "Retrieve list of all registered volunteers in the system."
    )
    public ResponseEntity<ApiResponse<List<Volunteer>>> getAllVolunteers() {
        List<Volunteer> volunteers = volunteerService.getAllVolunteers();
        return ResponseEntity.ok(ApiResponse.success(volunteers, "Volunteers retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get volunteer by ID",
            description = "Fetch skills, availability status, and user details of a volunteer."
    )
    public ResponseEntity<ApiResponse<Volunteer>> getVolunteerById(@PathVariable Long id) {
        Volunteer volunteer = volunteerService.getVolunteerById(id);
        return ResponseEntity.ok(ApiResponse.success(volunteer, "Volunteer details retrieved successfully"));
    }

    @GetMapping("/user/{userId}")
    @Operation(
            summary = "Get volunteer by user ID",
            description = "Fetch volunteer profile associated with a specific user account."
    )
    public ResponseEntity<ApiResponse<Volunteer>> getVolunteerByUserId(@PathVariable Long userId) {
        Volunteer volunteer = volunteerService.getVolunteerByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(volunteer, "Volunteer profile retrieved successfully"));
    }

    @PutMapping("/{id}/availability")
    @Operation(
            summary = "Toggle availability status",
            description = "Update volunteer availability flag (available to serve or busy/offline)."
    )
    public ResponseEntity<ApiResponse<Volunteer>> updateAvailability(
            @PathVariable Long id, @RequestParam boolean availability) {
        Volunteer volunteer = volunteerService.updateAvailability(id, availability);
        return ResponseEntity.ok(ApiResponse.success(volunteer, "Availability updated successfully"));
    }

    @GetMapping("/available")
    @Operation(
            summary = "Get available volunteers",
            description = "Retrieve list of volunteers who are currently marked as available."
    )
    public ResponseEntity<ApiResponse<List<Volunteer>>> getAvailableVolunteers() {
        List<Volunteer> volunteers = volunteerService.getVolunteersByAvailability(true);
        return ResponseEntity.ok(ApiResponse.success(volunteers, "Available volunteers retrieved successfully"));
    }
}
