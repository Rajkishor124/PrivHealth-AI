package com.privhealth.backend.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "staff_status", length = 20)
    private StaffStatus staffStatus;

    // Staff Profile Fields
    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(length = 100)
    private String specialization;

    @Column(length = 100)
    private String qualification;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "medical_license_number", length = 100)
    private String medicalLicenseNumber;

    @Column(name = "joining_date")
    private java.time.LocalDate joiningDate;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String designation;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "hospital_id")
    private Long hospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    private com.privhealth.backend.hospital.entity.Hospital hospital;
}
