package com.privhealth.backend.tracking.dto;

import com.privhealth.backend.tracking.entity.SymptomSeverity;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PatientSymptomResponse {
    private Long id;
    private Long patientId;
    private Long symptomId;
    private String symptomName;
    private String category;
    private SymptomSeverity severity;
    private String notes;
    private Instant recordedAt;
}
