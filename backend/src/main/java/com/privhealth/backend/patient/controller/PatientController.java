package com.privhealth.backend.patient.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.patient.dto.*;
import com.privhealth.backend.patient.service.PatientService;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PatientResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PatientRequest request,
            HttpServletRequest httpRequest) {
        PatientResponse patient = patientService.create(principal, request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Patient registered successfully", patient));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<PatientSummaryResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Page<PatientSummaryResponse> result = patientService.list(principal, search,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Patients retrieved", result.getContent(),
                PageMeta.from(result)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PatientResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        PatientResponse patient = patientService.get(principal, id);
        return ResponseEntity.ok(ApiResponse.ok(patient));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request,
            HttpServletRequest httpRequest) {
        PatientResponse patient = patientService.update(principal, id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Patient updated successfully", patient));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        patientService.delete(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Patient deactivated successfully", null));
    }

    @PostMapping("/{id}/assign-doctor")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AssignDoctorRequest request,
            HttpServletRequest httpRequest) {
        patientService.assignDoctor(principal, id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Doctor assigned successfully", null));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponse>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        PatientResponse patient = patientService.getMyProfile(principal);
        return ResponseEntity.ok(ApiResponse.ok(patient));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponse>> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PatientSelfUpdateRequest request,
            HttpServletRequest httpRequest) {
        PatientResponse patient = patientService.updateProfile(principal, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", patient));
    }
}
