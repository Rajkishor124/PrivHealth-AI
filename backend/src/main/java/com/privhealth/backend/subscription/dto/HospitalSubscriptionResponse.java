package com.privhealth.backend.subscription.dto;

import com.privhealth.backend.subscription.entity.SubscriptionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class HospitalSubscriptionResponse {
    private Long id;
    private Long hospitalId;
    private SubscriptionPlanResponse plan;
    private LocalDate startDate;
    private LocalDate endDate;
    private SubscriptionStatus status;
    private boolean autoRenew;
    private LocalDate trialStartDate;
    private LocalDate trialEndDate;
}
