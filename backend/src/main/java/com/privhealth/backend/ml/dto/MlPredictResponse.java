package com.privhealth.backend.ml.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MlPredictResponse {

    @JsonProperty("risk_score")
    private double riskScore;

    @JsonProperty("risk_category")
    private String riskCategory;

    @JsonProperty("base_value")
    private double baseValue;

    private List<MlContribution> contributions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MlContribution {
        private String feature;
        private double value;
    }
}
