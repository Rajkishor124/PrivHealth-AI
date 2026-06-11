package com.privhealth.backend.emr.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.emr.dto.DiagnosisRequest;
import com.privhealth.backend.emr.dto.DiagnosisResponse;
import com.privhealth.backend.emr.service.DiagnosisService;
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
@RequestMapping("/api/diagnoses")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DiagnosisResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DiagnosisRequest request,
            HttpServletRequest httpRequest) {
        DiagnosisResponse response = diagnosisService.create(principal, request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Diagnosis created successfully", response));
    }

    @GetMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT')")
    public ResponseEntity<ApiResponse<java.util.List<DiagnosisResponse>>> listByConsultation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long consultationId) {
        return ResponseEntity.ok(ApiResponse.ok(diagnosisService.listByConsultation(principal, consultationId)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<DiagnosisResponse>>> listByPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DiagnosisResponse> result = diagnosisService.listByPatient(principal, patientId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Diagnoses retrieved", result.getContent(),
                PageMeta.from(result)));
    }
}
