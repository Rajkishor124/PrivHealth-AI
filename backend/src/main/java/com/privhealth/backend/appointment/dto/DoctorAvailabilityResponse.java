package com.privhealth.backend.appointment.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorAvailabilityResponse {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private Integer maxAppointmentsPerSlot;
    private Boolean active;
}
