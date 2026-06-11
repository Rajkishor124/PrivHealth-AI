package com.privhealth.backend.emr.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.emr.dto.MedicalReportRequest;
import com.privhealth.backend.emr.dto.MedicalReportResponse;
import com.privhealth.backend.emr.service.MedicalReportService;
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
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class MedicalReportController {

    private final MedicalReportService medicalReportService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalReportResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MedicalReportRequest request,
            HttpServletRequest httpRequest) {
        MedicalReportResponse response = medicalReportService.create(principal, request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Report created successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT')")
    public ResponseEntity<ApiResponse<MedicalReportResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(medicalReportService.get(principal, id)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<MedicalReportResponse>>> listByPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MedicalReportResponse> result = medicalReportService.listByPatient(principal, patientId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Reports retrieved", result.getContent(),
                PageMeta.from(result)));
    }
}
