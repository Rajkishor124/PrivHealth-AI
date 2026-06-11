package com.privhealth.backend.prediction.entity;

import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.hospital.entity.Hospital;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "risk_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private TargetDisease targetDisease;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RiskCategory riskCategory;

    @Column(nullable = false)
    private Double riskScore;

    @Column(nullable = false)
    private Double confidenceScore;

    @Column(nullable = false, length = 50)
    private String modelVersion;

    @Column(columnDefinition = "TEXT")
    private String predictionSummary;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @CreationTimestamp
    private ZonedDateTime generatedAt;

    @OneToMany(mappedBy = "riskAssessment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RiskAssessmentExplanation> explanations = new ArrayList<>();
}
