package com.privhealth.backend.emr.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionRequest {
    @NotNull private Long consultationId;
    private LocalDate prescriptionDate;
    private String notes;
    private List<PrescriptionMedicineDto> medicines;
}
