package com.privhealth.backend.explanation.dto;

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
public class ExplanationResponse {
    private Long predictionId;
    private double riskScore;
    private RiskCategory riskCategory;
    private double baseValue;
    private List<FeatureContributionDto> contributions;
}
