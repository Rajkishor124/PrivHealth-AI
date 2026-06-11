package com.privhealth.backend.patient.dto;

import com.privhealth.backend.patient.entity.Gender;
import com.privhealth.backend.prediction.entity.RiskCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientSummaryResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private java.time.LocalDate dateOfBirth;
    private Gender gender;
    private String phone;
    private com.privhealth.backend.patient.entity.PatientStatus status;
    private String createdAt;
    private RiskCategory lastRiskCategory;
}
