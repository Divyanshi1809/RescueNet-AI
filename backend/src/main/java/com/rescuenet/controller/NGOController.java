package com.rescuenet.controller;

import com.rescuenet.dto.ApiResponse;
import com.rescuenet.entity.NGO;
import com.rescuenet.service.NGOService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ngos")
@Tag(name = "NGO Operations", description = "Endpoints for NGO profiles registration and listings")
@CrossOrigin
public class NGOController {

    @Autowired
    private NGOService ngoService;

    @PostMapping("/register")
    @Operation(summary = "Register NGO profile", description = "Create an NGO organization details profile linked to the authenticated user account.")
    public ResponseEntity<ApiResponse<NGO>> registerNGO(
            @Valid @RequestBody NGO ngoDetails, Authentication authentication) {
        String username = authentication.getName();
        NGO ngo = ngoService.registerNGO(username, ngoDetails);
        return ResponseEntity.ok(ApiResponse.success(ngo, "NGO profile registered successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all registered NGOs", description = "List all registered relief organization details.")
    public ResponseEntity<ApiResponse<List<NGO>>> getAllNGOs() {
        List<NGO> ngos = ngoService.getAllNGOs();
        return ResponseEntity.ok(ApiResponse.success(ngos, "NGO profiles retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get NGO profile details", description = "Fetch Focus areas, contacts, and registration details of an NGO by profile identifier.")
    public ResponseEntity<ApiResponse<NGO>> getNGOById(@PathVariable Long id) {
        NGO ngo = ngoService.getNGOById(id);
        return ResponseEntity.ok(ApiResponse.success(ngo, "NGO details retrieved successfully"));
    }
}
