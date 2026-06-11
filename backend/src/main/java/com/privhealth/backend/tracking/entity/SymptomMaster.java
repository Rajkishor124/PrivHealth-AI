package com.privhealth.backend.tracking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "symptom_master")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SymptomMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SymptomCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
