package com.privhealth.backend.prediction.entity;

public enum RiskCategory {
    LOW,
    MODERATE,
    HIGH,
    CRITICAL;

    public static RiskCategory fromScore(double score) {
        if (score < 0.33) return LOW;
        if (score <= 0.66) return MODERATE;
        if (score <= 0.85) return HIGH;
        return CRITICAL;
    }
}
