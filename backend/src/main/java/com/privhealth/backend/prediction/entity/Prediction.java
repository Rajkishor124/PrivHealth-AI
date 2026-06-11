package com.privhealth.backend.prediction.entity;

import com.privhealth.backend.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "risk_score", nullable = false)
    private double riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_category", nullable = false, length = 10)
    private RiskCategory riskCategory;

    @Column(name = "input_age", nullable = false)
    private int inputAge;

    @Column(name = "input_blood_pressure", nullable = false)
    private int inputBloodPressure;

    @Column(name = "input_cholesterol", nullable = false)
    private int inputCholesterol;

    @Column(name = "input_diabetes", nullable = false)
    private boolean inputDiabetes;

    @Column(name = "input_bmi", nullable = false)
    private double inputBmi;

    @Column(name = "input_heart_rate", nullable = false)
    private int inputHeartRate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "hospital_id")
    private Long hospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    private com.privhealth.backend.hospital.entity.Hospital hospital;
}
