package com.privhealth.backend.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RescheduleRequest {
    @NotNull
    private String appointmentDate; // yyyy-MM-dd
    @NotNull
    private String appointmentTime; // HH:mm
}
