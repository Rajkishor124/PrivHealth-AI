package com.privhealth.backend.tracking.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class HealthTrendsResponse {
    private List<PatientVitalsResponse> vitalsHistory;
    private Map<String, Long> symptomFrequencies;
}
