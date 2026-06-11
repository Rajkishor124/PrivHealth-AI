package com.privhealth.backend.prediction.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Builder
public class ModelRegistryResponse {
    private Long id;
    private String modelName;
    private String version;
    private Double accuracy;
    private Double f1Score;
    private Boolean isActive;
    private ZonedDateTime createdAt;
}
