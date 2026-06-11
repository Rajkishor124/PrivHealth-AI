package com.privhealth.backend.ml.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlPredictRequest {
    private int age;

    @JsonProperty("blood_pressure")
    private int bloodPressure;

    private int cholesterol;
    private int diabetes; // 0 or 1

    private double bmi;

    @JsonProperty("heart_rate")
    private int heartRate;
}
