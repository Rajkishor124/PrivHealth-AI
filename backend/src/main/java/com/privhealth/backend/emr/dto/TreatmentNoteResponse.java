package com.privhealth.backend.emr.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TreatmentNoteResponse {
    private Long id;
    private Long consultationId;
    private String consultationNumber;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String title;
    private String description;
    private String createdAt;
}
