package com.privhealth.backend.appointment.dto;

import com.privhealth.backend.appointment.entity.AppointmentStatus;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentResponse {
    private Long id;
    private String appointmentNumber;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String appointmentDate;
    private String appointmentTime;
    private String reasonForVisit;
    private AppointmentStatus status;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
