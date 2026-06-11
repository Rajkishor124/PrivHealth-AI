package com.privhealth.backend.explanation.entity;

import com.privhealth.backend.prediction.entity.Prediction;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "explanations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Explanation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prediction_id", nullable = false)
    private Long predictionId;

    @Column(name = "feature_name", nullable = false, length = 50)
    private String featureName;

    @Column(nullable = false)
    private double contribution;

    @Column(name = "base_value", nullable = false)
    private double baseValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediction_id", insertable = false, updatable = false)
    private Prediction prediction;
}
