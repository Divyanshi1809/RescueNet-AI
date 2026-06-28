package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.entity.Shelter;
import com.rescuenet.service.ShelterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shelters")
@Tag(name = "Shelters", description = "Endpoints to create and manage temporary relief shelters")
@CrossOrigin
public class ShelterController {

    @Autowired
    private ShelterService shelterService;

    @PostMapping
    @Operation(summary = "Register shelter location", description = "Setup a new temporary housing center specifying capacity, details, and location coordinates.")
    public ResponseEntity<ApiResponse<Shelter>> createShelter(@Valid @RequestBody Shelter shelter) {
        Shelter createdShelter = shelterService.createShelter(shelter);
        return ResponseEntity.ok(ApiResponse.success(createdShelter, "Shelter registered successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all shelters", description = "Retrieve list of all registered housing facilities.")
    public ResponseEntity<ApiResponse<List<Shelter>>> getAllShelters() {
        List<Shelter> shelters = shelterService.getAllShelters();
        return ResponseEntity.ok(ApiResponse.success(shelters, "Shelters retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shelter detail", description = "Fetch occupancy and contacts of a facility by ID.")
    public ResponseEntity<ApiResponse<Shelter>> getShelterById(@PathVariable Long id) {
        Shelter shelter = shelterService.getShelterById(id);
        return ResponseEntity.ok(ApiResponse.success(shelter, "Shelter details retrieved successfully"));
    }

    @PutMapping("/{id}/occupancy")
    @Operation(summary = "Update shelter occupancy", description = "Set number of people currently housed in the shelter. Re-evaluates status (e.g. FULL).")
    public ResponseEntity<ApiResponse<Shelter>> updateOccupancy(
            @PathVariable Long id, @RequestParam int occupiedCapacity) {
        Shelter shelter = shelterService.updateOccupancy(id, occupiedCapacity);
        return ResponseEntity.ok(ApiResponse.success(shelter, "Shelter occupancy updated successfully"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update shelter status", description = "Toggle status flag directly (ACTIVE, FULL, CLOSED).")
    public ResponseEntity<ApiResponse<Shelter>> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        Shelter shelter = shelterService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(shelter, "Shelter status updated successfully"));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Filter shelters by status", description = "Get a list of facilities of a particular status.")
    public ResponseEntity<ApiResponse<List<Shelter>>> getSheltersByStatus(@PathVariable String status) {
        List<Shelter> shelters = shelterService.getSheltersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(shelters, "Shelters retrieved successfully"));
    }
}
