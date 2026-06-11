package com.privhealth.backend.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "platform_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "platform_name", nullable = false, length = 150)
    private String platformName;

    @Column(name = "support_email", nullable = false, length = 255)
    private String supportEmail;

    @Column(name = "default_trial_days", nullable = false)
    private int defaultTrialDays;

    @Column(name = "maintenance_mode", nullable = false)
    private boolean maintenanceMode;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
