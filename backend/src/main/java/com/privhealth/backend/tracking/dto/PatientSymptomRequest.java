package com.privhealth.backend.tracking.dto;

import com.privhealth.backend.tracking.entity.SymptomSeverity;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PatientSymptomRequest {
    private Long patientId; // Optional if logged-in user is PATIENT
    
    @NotNull(message = "Symptom is required")
    private Long symptomId;
    
    @NotNull(message = "Severity is required")
    private SymptomSeverity severity;
    
    private String notes;
}
