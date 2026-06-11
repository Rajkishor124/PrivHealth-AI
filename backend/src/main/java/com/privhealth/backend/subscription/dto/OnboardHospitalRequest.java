package com.privhealth.backend.subscription.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OnboardHospitalRequest {
    @NotBlank(message = "Hospital name is required")
    private String name;

    @NotBlank(message = "Hospital address is required")
    private String address;

    @NotBlank(message = "Hospital contact number is required")
    private String contactNumber;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Admin email should be valid")
    private String adminEmail;

    @NotBlank(message = "Admin password is required")
    private String adminPassword;

    @NotNull(message = "Subscription plan ID is required")
    private Long subscriptionPlanId;
}
