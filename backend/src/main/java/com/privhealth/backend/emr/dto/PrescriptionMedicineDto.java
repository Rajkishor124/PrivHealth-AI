package com.privhealth.backend.emr.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionMedicineDto {
    private Long id;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
}
