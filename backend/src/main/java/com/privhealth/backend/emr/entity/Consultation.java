package com.privhealth.backend.emr.entity;

import com.privhealth.backend.hospital.entity.Hospital;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "consultations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consultation_number", nullable = false, unique = true, length = 50)
    private String consultationNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "consultation_date", nullable = false)
    private LocalDate consultationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "consultation_type", nullable = false, length = 20)
    private ConsultationType consultationType;

    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "consultation_notes", columnDefinition = "TEXT")
    private String consultationNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConsultationStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    private Hospital hospital;
}
