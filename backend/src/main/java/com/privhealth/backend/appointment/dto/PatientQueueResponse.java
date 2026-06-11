package com.privhealth.backend.appointment.dto;

import com.privhealth.backend.appointment.entity.QueueStatus;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientQueueResponse {
    private Long id;
    private Long appointmentId;
    private String appointmentNumber;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String tokenNumber;
    private Integer queuePosition;
    private QueueStatus status;
    private String checkInTime;
    private String calledTime;
    private String consultationStartTime;
    private String completedTime;
    private String reasonForVisit;
}
