package com.privhealth.backend.subscription.dto;

import com.privhealth.backend.hospital.dto.HospitalResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OnboardHospitalResponse {
    private HospitalResponse hospital;
    private HospitalSubscriptionResponse subscription;
    private String adminEmail;
}
