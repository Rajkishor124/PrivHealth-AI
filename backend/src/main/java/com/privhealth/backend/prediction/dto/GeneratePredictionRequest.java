package com.privhealth.backend.prediction.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GeneratePredictionRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;
}
