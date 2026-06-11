package com.privhealth.backend.prediction.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "model_registry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelRegistry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String modelName;

    @Column(nullable = false, length = 50, unique = true)
    private String version;

    @Column(nullable = false)
    private ZonedDateTime trainingDate;

    private Double accuracy;
    private Double precisionScore;
    private Double recall;
    private Double f1Score;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
