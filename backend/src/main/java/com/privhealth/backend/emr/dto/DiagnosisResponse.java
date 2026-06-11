package com.privhealth.backend.emr.dto;

import com.privhealth.backend.emr.entity.Severity;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DiagnosisResponse {
    private Long id;
    private Long consultationId;
    private String consultationNumber;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String diagnosisCode;
    private String diagnosisName;
    private String diagnosisDescription;
    private Severity severity;
    private String diagnosisDate;
    private String createdAt;
}
