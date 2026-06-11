package com.privhealth.backend.subscription.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SubscriptionPlanRequest {
    private String name;
    private String description;
    private int maxDoctors;
    private int maxPatients;
    private int maxStorageGB;
    private int maxPredictionsPerMonth;
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private boolean active;
}
