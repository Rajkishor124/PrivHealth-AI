package com.privhealth.backend.emr.dto;

import lombok.*;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionResponse {
    private Long id;
    private Long consultationId;
    private String consultationNumber;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String prescriptionDate;
    private String notes;
    private List<PrescriptionMedicineDto> medicines;
    private String createdAt;
}
