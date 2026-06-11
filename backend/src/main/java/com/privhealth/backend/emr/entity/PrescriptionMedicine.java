package com.privhealth.backend.emr.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_medicines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionMedicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prescription_id", nullable = false)
    private Long prescriptionId;

    @Column(name = "medicine_name", nullable = false, length = 255)
    private String medicineName;

    @Column(length = 100)
    private String dosage;

    @Column(length = 100)
    private String frequency;

    @Column(length = 100)
    private String duration;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", insertable = false, updatable = false)
    private Prescription prescription;
}
