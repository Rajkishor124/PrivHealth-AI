package com.privhealth.backend.prediction.dto;

import com.privhealth.backend.prediction.entity.RiskCategory;
import com.privhealth.backend.prediction.entity.TargetDisease;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
public class RiskAssessmentResponse {
    private Long id;
    private Long patientId;
    private TargetDisease targetDisease;
    private RiskCategory riskCategory;
    private Double riskScore;
    private Double confidenceScore;
    private String modelVersion;
    private String predictionSummary;
    private String recommendations;
    private ZonedDateTime generatedAt;
    private List<ExplanationDto> explanations;

    @Data
    @Builder
    public static class ExplanationDto {
        private String featureName;
        private Double contributionValue;
    }
}
