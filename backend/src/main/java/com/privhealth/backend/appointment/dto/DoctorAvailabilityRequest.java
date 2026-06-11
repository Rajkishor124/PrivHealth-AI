package com.privhealth.backend.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorAvailabilityRequest {
    @NotNull
    private Long doctorId;
    @NotNull
    private String dayOfWeek; // MONDAY, TUESDAY, etc.
    @NotNull
    private String startTime; // HH:mm
    @NotNull
    private String endTime;   // HH:mm
    private Integer maxAppointmentsPerSlot;
    private Boolean active;
}
