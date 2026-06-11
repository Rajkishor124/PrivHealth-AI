package com.privhealth.backend.prediction.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientFeatureProfile {
    private Long patientId;
    private Integer age;
    private Integer systolicBloodPressure;
    private Integer diastolicBloodPressure;
    private Integer heartRate;
    private Double bmi;
    private Integer bloodSugar;
    private Integer cholesterol;
    private Integer activeSymptomCount;
    private Integer existingDiagnosisCount;
    private Boolean hasDiabetes;
}
