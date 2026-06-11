package com.privhealth.backend.prediction.dto;

import com.privhealth.backend.prediction.entity.RiskAlertSeverity;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Builder
public class RiskAlertResponse {
    private Long id;
    private Long patientId;
    private String alertType;
    private RiskAlertSeverity severity;
    private String message;
    private ZonedDateTime generatedAt;
}
