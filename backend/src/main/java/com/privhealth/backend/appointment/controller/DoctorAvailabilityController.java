package com.privhealth.backend.appointment.controller;

import com.privhealth.backend.appointment.dto.DoctorAvailabilityRequest;
import com.privhealth.backend.appointment.dto.DoctorAvailabilityResponse;
import com.privhealth.backend.appointment.service.DoctorAvailabilityService;
import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor-availability")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    @PostMapping
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DoctorAvailabilityResponse>> set(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorAvailabilityRequest request) {
        DoctorAvailabilityResponse response = availabilityService.setAvailability(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Availability set successfully", response));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityResponse>>> getByDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long doctorId) {
        List<DoctorAvailabilityResponse> response = availabilityService.getByDoctor(principal, doctorId);
        return ResponseEntity.ok(ApiResponse.ok("Doctor availability retrieved", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityResponse>>> getByHospital(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<DoctorAvailabilityResponse> response = availabilityService.getByHospital(principal);
        return ResponseEntity.ok(ApiResponse.ok("Hospital availability retrieved", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        availabilityService.delete(principal, id);
        return ResponseEntity.ok(ApiResponse.ok("Availability slot deleted", null));
    }
}
