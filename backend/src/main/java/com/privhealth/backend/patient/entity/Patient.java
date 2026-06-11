package com.privhealth.backend.patient.entity;

import com.privhealth.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "first_name", nullable = false, length = 120)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    private java.time.LocalDate dateOfBirth;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(name = "profile_photo", length = 255)
    private String profilePhoto;

    @Column(length = 50)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "emergency_contact_name", length = 150)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 50)
    private String emergencyContactPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PatientStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(name = "encrypted_medical_history", nullable = false, columnDefinition = "TEXT")
    private String encryptedMedicalHistory;

    @Column(name = "medical_history_hmac", nullable = false, length = 128)
    private String medicalHistoryHmac;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Relationships for join queries
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User linkedUser;

    @Column(name = "hospital_id")
    private Long hospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    private com.privhealth.backend.hospital.entity.Hospital hospital;
}
