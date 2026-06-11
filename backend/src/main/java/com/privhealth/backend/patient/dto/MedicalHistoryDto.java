package com.privhealth.backend.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryDto {
    private Double height;
    private Double weight;
    private String allergies;
    private String existingConditions;
}
