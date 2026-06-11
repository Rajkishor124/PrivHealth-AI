package com.privhealth.backend.prediction.dto;

import com.privhealth.backend.prediction.entity.TargetDisease;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Builder
public class RiskTrendResponse {
    private Long riskAssessmentId;
    private TargetDisease targetDisease;
    private Double riskScore;
    private ZonedDateTime generatedAt;
}
