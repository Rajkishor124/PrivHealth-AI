package com.privhealth.backend.tracking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PatientVitalsResponse {
    private Long id;
    private Long patientId;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer heartRate;
    private Integer oxygenSaturation;
    private Double temperature;
    private Integer bloodSugar;
    private Double weight;
    private Double height;
    private Double bmi;
    private Instant recordedAt;
}
