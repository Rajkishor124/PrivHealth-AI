package com.privhealth.backend.admin.dto;

import com.privhealth.backend.prediction.entity.RiskCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private long totalUsers;
    private long totalDoctors;
    private long pendingDoctors;
    private long totalPatients;
    private long totalPredictions;
    private long totalReceptionists;
    private long totalTechnicians;
    private long totalActiveStaff;
    private long totalConsultations;
    private long totalDiagnoses;
    private long totalPrescriptions;
    private long totalAppointments;
    private long todayAppointments;
    private long todayCheckedIn;
    private long todayWaiting;
    private long todayCompleted;
    private Map<RiskCategory, Long> riskDistribution;
    private List<DailyPredictionCount> predictionsLast30Days;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyPredictionCount {
        private String date;
        private long count;
    }
}
