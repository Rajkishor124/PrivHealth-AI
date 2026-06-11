package com.privhealth.backend.subscription.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.privhealth.backend.subscription.dto.HospitalSubscriptionResponse;
import com.privhealth.backend.subscription.dto.OnboardHospitalRequest;
import com.privhealth.backend.subscription.dto.OnboardHospitalResponse;
import com.privhealth.backend.subscription.dto.PlatformAnalyticsResponse;
import com.privhealth.backend.subscription.dto.TenantUsageResponse;
import com.privhealth.backend.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/platform")
@RequiredArgsConstructor
public class PlatformController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/onboard")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OnboardHospitalResponse>> onboardHospital(@Valid @RequestBody OnboardHospitalRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.ok("Hospital onboarded successfully", subscriptionService.onboardHospital(request, httpRequest)));
    }

    @GetMapping("/my-subscription")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<HospitalSubscriptionResponse>> getMySubscription(@AuthenticationPrincipal UserPrincipal principal) {
        Long hospitalId = principal.getHospitalId();
        if (hospitalId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User does not belong to a hospital", "INVALID_USER"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Subscription retrieved", subscriptionService.getHospitalSubscription(hospitalId)));
    }

    @GetMapping("/my-usage")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantUsageResponse>> getMyUsage(@AuthenticationPrincipal UserPrincipal principal) {
        Long hospitalId = principal.getHospitalId();
        if (hospitalId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User does not belong to a hospital", "INVALID_USER"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Usage retrieved", subscriptionService.getTenantUsage(hospitalId)));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PlatformAnalyticsResponse>> getPlatformAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok("Platform analytics retrieved", subscriptionService.getPlatformAnalytics()));
    }
}
