package com.privhealth.backend.subscription.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class SubscriptionPlanResponse {
    private Long id;
    private String name;
    private String description;
    private int maxDoctors;
    private int maxPatients;
    private int maxStorageGB;
    private int maxPredictionsPerMonth;
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
