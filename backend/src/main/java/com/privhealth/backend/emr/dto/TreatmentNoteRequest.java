package com.privhealth.backend.emr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TreatmentNoteRequest {
    @NotNull private Long consultationId;
    @NotBlank private String title;
    private String description;
}
