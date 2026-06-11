package com.privhealth.backend.hospital.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HospitalRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String address;

    @Email(message = "Valid contact email is required")
    private String contactEmail;

    private String contactPhone;
}
