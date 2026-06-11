package com.privhealth.backend.subscription.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.subscription.dto.SubscriptionPlanRequest;
import com.privhealth.backend.subscription.dto.SubscriptionPlanResponse;
import com.privhealth.backend.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getAllPlans() {
        return ResponseEntity.ok(ApiResponse.ok("Plans retrieved successfully", subscriptionService.getAllPlans()));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Plan retrieved successfully", subscriptionService.getPlanById(id)));
    }

    @PostMapping("/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> createPlan(@Valid @RequestBody SubscriptionPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Plan created successfully", subscriptionService.createPlan(request)));
    }

    @PutMapping("/plans/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> updatePlan(@PathVariable Long id, @Valid @RequestBody SubscriptionPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Plan updated successfully", subscriptionService.updatePlan(id, request)));
    }
}
