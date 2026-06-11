package com.privhealth.backend.staff.dto;

import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.StaffStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class StaffResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private StaffStatus status;
    private String employeeId;
    private String specialization;
    private String qualification;
    private Integer yearsOfExperience;
    private String medicalLicenseNumber;
    private String department;
    private String designation;
    private LocalDate joiningDate;
    private String createdAt;
}
