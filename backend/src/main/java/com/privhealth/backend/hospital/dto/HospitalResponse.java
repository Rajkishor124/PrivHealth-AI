package com.privhealth.backend.hospital.dto;

import com.privhealth.backend.hospital.entity.HospitalStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HospitalResponse {
    private Long id;
    private String name;
    private String hospitalCode;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private HospitalStatus status;
    private String createdAt;
}
