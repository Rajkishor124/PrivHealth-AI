package com.privhealth.backend.subscription.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlatformAnalyticsResponse {
    private long totalHospitals;
    private long totalActiveSubscriptions;
    private long totalDoctors;
    private long totalPatients;
    private long totalPredictionsThisMonth;
    // other global metrics if needed
}
