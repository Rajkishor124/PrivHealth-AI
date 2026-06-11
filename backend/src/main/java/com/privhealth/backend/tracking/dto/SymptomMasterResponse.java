package com.privhealth.backend.tracking.dto;

import com.privhealth.backend.tracking.entity.SymptomCategory;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SymptomMasterResponse {
    private Long id;
    private String name;
    private SymptomCategory category;
    private String description;
}
