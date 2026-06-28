package com.rescuenet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyRequestDTO {

    @NotBlank(message = "Requester name is required")
    private String requesterName;

    @NotBlank(message = "Requester phone is required")
    private String requesterPhone;

    @NotBlank(message = "Location is required")
    private String location;

    private double latitude;
    private double longitude;

    private String description;

    @NotBlank(message = "Severity is required")
    @Pattern(regexp = "LOW|MEDIUM|HIGH|CRITICAL", message = "Severity must be LOW, MEDIUM, HIGH, or CRITICAL")
    private String severity;

    @Pattern(regexp = "PENDING|ASSIGNED|COMPLETED", message = "Status must be PENDING, ASSIGNED, or COMPLETED")
    private String status;
}
