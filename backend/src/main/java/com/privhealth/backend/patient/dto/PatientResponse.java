package com.privhealth.backend.patient.dto;

import com.privhealth.backend.patient.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private String firstName;
    private String lastName;
    private java.time.LocalDate dateOfBirth;
    private Gender gender;
    private String bloodGroup;
    private String profilePhoto;
    private String phone;
    private String email;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private com.privhealth.backend.patient.entity.PatientStatus status;
    private Double height;
    private Double weight;
    private String allergies;
    private String existingConditions;
    private String temporaryPassword; // Only returned on creation
    private String createdAt;
}
