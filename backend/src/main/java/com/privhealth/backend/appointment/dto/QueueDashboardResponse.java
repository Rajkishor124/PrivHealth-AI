package com.privhealth.backend.appointment.dto;

import lombok.*;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class QueueDashboardResponse {
    private long totalToday;
    private long waiting;
    private long called;
    private long inConsultation;
    private long completed;
    private long skipped;
    private PatientQueueResponse currentPatient;
    private List<PatientQueueResponse> queue;
}
