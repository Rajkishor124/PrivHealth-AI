package com.privhealth.backend.auth.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must not exceed 120 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = ".*[A-Z].*", message = "Password must contain at least one uppercase letter")
    @Pattern(regexp = ".*[0-9].*", message = "Password must contain at least one digit")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "HOSPITAL_ADMIN|DOCTOR|RECEPTIONIST|TECHNICIAN|PATIENT", message = "Invalid role")
    private String role;

    @NotBlank(message = "Hospital code is required")
    private String hospitalCode;
}
