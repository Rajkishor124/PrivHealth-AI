package com.privhealth.backend.tracking.dto;

import lombok.Data;

@Data
public class PatientVitalsRequest {
    private Long patientId; // Optional if logged-in user is PATIENT
    
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer heartRate;
    private Integer oxygenSaturation;
    private Double temperature;
    private Integer bloodSugar;
    private Double weight;
    private Double height;
}
