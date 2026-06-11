package com.privhealth.backend.patient.dto;

import com.privhealth.backend.patient.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {
    @NotBlank(message = "First name is required")
    @Size(max = 120)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @NotNull(message = "Date of birth is required")
    private java.time.LocalDate dateOfBirth;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @Size(max = 10)
    private String bloodGroup;

    @Size(max = 50)
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 150)
    private String email;

    private String address;

    @Size(max = 150)
    private String emergencyContactName;

    @Size(max = 50)
    private String emergencyContactPhone;

    private Long doctorId;

    private Double height;
    private Double weight;
    private String allergies;
    private String existingConditions;
}
