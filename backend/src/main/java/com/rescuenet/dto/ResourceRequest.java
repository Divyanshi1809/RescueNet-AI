package com.rescuenet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotBlank(message = "Resource type is required (e.g. FOOD, WATER, MEDICAL, BLANKETS)")
    private String type;

    @Min(value = 0, message = "Quantity must be equal or greater than 0")
    private int quantity;

    private String description;

    private String status; // AVAILABLE, ALLOCATED, REQUESTED

    private String location; // geographical center or address

    private Long shelterId; // optional shelter association
}
