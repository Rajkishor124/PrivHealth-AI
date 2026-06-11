package com.privhealth.backend.emr.dto;

import com.privhealth.backend.emr.entity.ConsultationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsultationRequest {
    @NotNull private Long patientId;
    private LocalDate consultationDate;
    private ConsultationType consultationType;
    @NotBlank private String chiefComplaint;
    private String consultationNotes;
}
