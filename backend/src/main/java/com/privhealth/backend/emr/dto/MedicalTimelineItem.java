package com.privhealth.backend.emr.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalTimelineItem {
    private String type; // CONSULTATION, DIAGNOSIS, PRESCRIPTION, TREATMENT_NOTE, REPORT
    private Long id;
    private String title;
    private String description;
    private String doctorName;
    private String date;
}
