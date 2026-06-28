package com.rescuenet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DisasterRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Location coordinates or address are required")
    private String location; // format: "latitude, longitude" or address string

    private double latitude;
    private double longitude;

    @NotBlank(message = "Disaster type is required (e.g. FLOOD, EARTHQUAKE, FIRE)")
    private String disasterType;

    @NotBlank(message = "Severity level is required (LOW, MEDIUM, HIGH, CRITICAL)")
    private String severity;

    private String status; // PENDING, ACTIVE, RESOLVED
}
