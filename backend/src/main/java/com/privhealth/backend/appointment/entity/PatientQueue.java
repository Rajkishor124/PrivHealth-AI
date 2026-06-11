package com.privhealth.backend.appointment.entity;

import com.privhealth.backend.hospital.entity.Hospital;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "patient_queue")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "token_number", nullable = false, length = 20)
    private String tokenNumber;

    @Column(name = "queue_position", nullable = false)
    private Integer queuePosition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QueueStatus status;

    @Column(name = "check_in_time", nullable = false)
    private Instant checkInTime;

    @Column(name = "called_time")
    private Instant calledTime;

    @Column(name = "consultation_start_time")
    private Instant consultationStartTime;

    @Column(name = "completed_time")
    private Instant completedTime;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", insertable = false, updatable = false)
    private Appointment appointment;

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
