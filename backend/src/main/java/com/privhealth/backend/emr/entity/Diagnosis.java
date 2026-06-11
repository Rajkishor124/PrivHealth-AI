package com.privhealth.backend.emr.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "diagnoses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Diagnosis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consultation_id", nullable = false)
    private Long consultationId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "diagnosis_code", length = 20)
    private String diagnosisCode;

    @Column(name = "diagnosis_name", nullable = false, length = 255)
    private String diagnosisName;

    @Column(name = "diagnosis_description", columnDefinition = "TEXT")
    private String diagnosisDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity;

    @Column(name = "diagnosis_date", nullable = false)
    private LocalDate diagnosisDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", insertable = false, updatable = false)
    private Consultation consultation;
}
