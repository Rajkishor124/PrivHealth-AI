package com.privhealth.backend.patient.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientSelfUpdateRequest {
    @Size(max = 50)
    private String phone;

    private String address;

    @Size(max = 150)
    private String emergencyContactName;

    @Size(max = 50)
    private String emergencyContactPhone;
}
