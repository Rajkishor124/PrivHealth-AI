package com.privhealth.backend.emr.dto;

import com.privhealth.backend.emr.entity.ReportType;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalReportResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String reportTitle;
    private ReportType reportType;
    private String reportDate;
    private String summary;
    private String attachmentUrl;
    private String createdAt;
}
