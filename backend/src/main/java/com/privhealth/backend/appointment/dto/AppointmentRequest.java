package com.privhealth.backend.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentRequest {
    @NotNull
    private Long patientId;
    @NotNull
    private Long doctorId;
    @NotNull
    private String appointmentDate; // yyyy-MM-dd
    @NotNull
    private String appointmentTime; // HH:mm
    private String reasonForVisit;
    private String notes;
}
