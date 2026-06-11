package com.privhealth.backend.prediction.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictionRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull @Min(0) @Max(120)
    private Integer age;

    @NotNull @Min(60) @Max(250)
    private Integer bloodPressure;

    @NotNull @Min(80) @Max(500)
    private Integer cholesterol;

    @NotNull
    private Boolean diabetes;

    @NotNull @DecimalMin("10.0") @DecimalMax("60.0")
    private Double bmi;

    @NotNull @Min(30) @Max(220)
    private Integer heartRate;
}
