package com.privhealth.backend.prediction.entity;

public enum RiskCategory {
    LOW,
    MODERATE,
    HIGH;

    public static RiskCategory fromScore(double score) {
        if (score < 0.33) return LOW;
        if (score <= 0.66) return MODERATE;
        return HIGH;
    }
}
