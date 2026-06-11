package com.privhealth.backend.subscription.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class TenantUsageResponse {
    private Long hospitalId;
    private int currentDoctors;
    private int currentPatients;
    private BigDecimal currentStorageUsageGb;
    private int currentPredictions;
    private int currentAppointments;
    private int currentConsultations;
    private LocalDate billingCycleStart;
    private LocalDate billingCycleEnd;
    
    // Limits
    private int maxDoctors;
    private int maxPatients;
    private int maxStorageGB;
    private int maxPredictionsPerMonth;
}
