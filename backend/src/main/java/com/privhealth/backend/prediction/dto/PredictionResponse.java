package com.privhealth.backend.prediction.dto;

import com.privhealth.backend.explanation.dto.FeatureContributionDto;
import com.privhealth.backend.prediction.entity.RiskCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private double riskScore;
    private RiskCategory riskCategory;
    private PredictionInputDto input;
    private String createdAt;
    private List<FeatureContributionDto> explanations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionInputDto {
        private int age;
        private int bloodPressure;
        private int cholesterol;
        private boolean diabetes;
        private double bmi;
        private int heartRate;
    }
}
