package com.privhealth.backend.appointment.dto;

import lombok.*;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentAnalyticsResponse {
    private long totalAppointments;
    private long todayAppointments;
    private long todayCheckedIn;
    private long todayWaiting;
    private long todayInConsultation;
    private long todayCompleted;
    private long todayCancelled;
    private long todayNoShow;
    private List<DoctorUtilization> doctorUtilization;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DoctorUtilization {
        private Long doctorId;
        private String doctorName;
        private long totalAppointments;
        private long completed;
        private long waiting;
    }
}
