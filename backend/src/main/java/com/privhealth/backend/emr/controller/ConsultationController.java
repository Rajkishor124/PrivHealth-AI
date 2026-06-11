package com.privhealth.backend.emr.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.emr.dto.ConsultationRequest;
import com.privhealth.backend.emr.dto.ConsultationResponse;
import com.privhealth.backend.emr.entity.ConsultationStatus;
import com.privhealth.backend.emr.service.ConsultationService;
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
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<ConsultationResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ConsultationRequest request,
            HttpServletRequest httpRequest) {
        ConsultationResponse response = consultationService.create(principal, request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Consultation created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<ConsultationResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Page<ConsultationResponse> result = consultationService.list(principal, search,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Consultations retrieved", result.getContent(),
                PageMeta.from(result)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT')")
    public ResponseEntity<ApiResponse<ConsultationResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ConsultationResponse response = consultationService.get(principal, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ConsultationResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam ConsultationStatus status,
            HttpServletRequest httpRequest) {
        ConsultationResponse response = consultationService.updateStatus(principal, id, status, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Consultation status updated", response));
    }
}
