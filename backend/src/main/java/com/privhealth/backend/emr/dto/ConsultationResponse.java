package com.privhealth.backend.emr.dto;

import com.privhealth.backend.emr.entity.ConsultationStatus;
import com.privhealth.backend.emr.entity.ConsultationType;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsultationResponse {
    private Long id;
    private String consultationNumber;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String consultationDate;
    private ConsultationType consultationType;
    private String chiefComplaint;
    private String consultationNotes;
    private ConsultationStatus status;
    private String createdAt;
}
