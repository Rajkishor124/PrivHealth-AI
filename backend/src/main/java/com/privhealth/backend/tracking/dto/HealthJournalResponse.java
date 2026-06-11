package com.privhealth.backend.tracking.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class HealthJournalResponse {
    private Long id;
    private Long patientId;
    private String title;
    private String description;
    private String mood;
    private Instant createdAt;
}
