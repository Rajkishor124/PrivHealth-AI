package com.privhealth.backend.emr.dto;

import com.privhealth.backend.emr.entity.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalReportRequest {
    @NotNull private Long patientId;
    @NotBlank private String reportTitle;
    private ReportType reportType;
    private LocalDate reportDate;
    private String summary;
    private String attachmentUrl;
}
