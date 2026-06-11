package com.privhealth.backend.tracking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HealthJournalRequest {
    private Long patientId; // Optional if logged-in user is PATIENT
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String mood;
}
