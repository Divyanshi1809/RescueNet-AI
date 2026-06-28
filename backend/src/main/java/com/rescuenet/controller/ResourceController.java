package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.dto.ResourceRequest;
import com.rescuenet.entity.Resource;
import com.rescuenet.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@Tag(name = "Resource Inventory", description = "Endpoints to create and allocate resources (food, water, medicine, blankets)")
@CrossOrigin
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping
    @Operation(summary = "Register emergency resources", description = "Add resource supplies with name, type, quantity, location and optional shelter associations.")
    public ResponseEntity<ApiResponse<Resource>> registerResource(
            @Valid @RequestBody ResourceRequest request, Authentication authentication) {
        String username = authentication.getName();
        Resource resource = resourceService.createResource(request, username);
        return ResponseEntity.ok(ApiResponse.success(resource, "Resource registered successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all registered resources", description = "Retrieve list of all supplies across all locations.")
    public ResponseEntity<ApiResponse<List<Resource>>> getAllResources() {
        List<Resource> resources = resourceService.getAllResources();
        return ResponseEntity.ok(ApiResponse.success(resources, "Resources retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource detail", description = "Retrieve detailed information for a single resource item.")
    public ResponseEntity<ApiResponse<Resource>> getResourceById(@PathVariable Long id) {
        Resource resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success(resource, "Resource details retrieved successfully"));
    }

    @PutMapping("/{id}/quantity")
    @Operation(summary = "Update resource quantity", description = "Update stock levels of a registered resource item.")
    public ResponseEntity<ApiResponse<Resource>> updateQuantity(
            @PathVariable Long id, @RequestParam int quantity) {
        Resource resource = resourceService.updateQuantity(id, quantity);
        return ResponseEntity.ok(ApiResponse.success(resource, "Resource quantity updated successfully"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update resource status", description = "Modify allocation status (AVAILABLE, REQUESTED, ALLOCATED).")
    public ResponseEntity<ApiResponse<Resource>> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        Resource resource = resourceService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(resource, "Resource status updated successfully"));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Filter resources by status", description = "List resources of a specific status.")
    public ResponseEntity<ApiResponse<List<Resource>>> getResourcesByStatus(@PathVariable String status) {
        List<Resource> resources = resourceService.getResourcesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(resources, "Resources retrieved successfully"));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Filter resources by type", description = "List resources of a specific category.")
    public ResponseEntity<ApiResponse<List<Resource>>> getResourcesByType(@PathVariable String type) {
        List<Resource> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(ApiResponse.success(resources, "Resources retrieved successfully"));
    }
}
