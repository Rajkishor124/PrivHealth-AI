package com.privhealth.backend.subscription.entity;

import com.privhealth.backend.hospital.entity.Hospital;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "usage_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false, unique = true)
    private Hospital hospital;

    @Column(name = "hospital_id", insertable = false, updatable = false)
    private Long hospitalId;

    @Column(name = "current_doctors", nullable = false)
    private int currentDoctors;

    @Column(name = "current_patients", nullable = false)
    private int currentPatients;

    @Column(name = "current_storage_usage_gb", nullable = false, precision = 10, scale = 3)
    private BigDecimal currentStorageUsageGb;

    @Column(name = "current_predictions", nullable = false)
    private int currentPredictions;

    @Column(name = "current_appointments", nullable = false)
    private int currentAppointments;

    @Column(name = "current_consultations", nullable = false)
    private int currentConsultations;

    @Column(name = "billing_cycle_start", nullable = false)
    private LocalDate billingCycleStart;

    @Column(name = "billing_cycle_end", nullable = false)
    private LocalDate billingCycleEnd;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
