package com.privhealth.backend.emr.dto;

import com.privhealth.backend.emr.entity.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DiagnosisRequest {
    @NotNull private Long consultationId;
    private String diagnosisCode;
    @NotBlank private String diagnosisName;
    private String diagnosisDescription;
    private Severity severity;
    private LocalDate diagnosisDate;
}
