package com.privhealth.backend.staff.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DoctorRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password; // Optional, can be auto-generated if null
    
    private String employeeId;
    private String specialization;
    private String qualification;
    private Integer yearsOfExperience;
    private String medicalLicenseNumber;
    private LocalDate joiningDate;
}
