package com.privhealth.backend.emr.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "medical_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "report_title", nullable = false, length = 255)
    private String reportTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 20)
    private ReportType reportType;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
