package com.privhealth.backend.prediction.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "risk_assessment_explanations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessmentExplanation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_assessment_id", nullable = false)
    private RiskAssessment riskAssessment;

    @Column(nullable = false, length = 100)
    private String featureName;

    @Column(nullable = false)
    private Double contributionValue;
}
