package com.privhealth.backend.appointment.entity;

import com.privhealth.backend.hospital.entity.Hospital;
import com.privhealth.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_availability",
       uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_id", "day_of_week"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 10)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "max_appointments_per_slot", nullable = false)
    private Integer maxAppointmentsPerSlot;

    @Column(nullable = false)
    private Boolean active;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    private Hospital hospital;
}
