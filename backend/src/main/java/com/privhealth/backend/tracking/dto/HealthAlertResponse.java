package com.privhealth.backend.tracking.dto;

import com.privhealth.backend.tracking.entity.AlertSeverity;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class HealthAlertResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private String alertType;
    private AlertSeverity severity;
    private String message;
    private Instant createdAt;
}
