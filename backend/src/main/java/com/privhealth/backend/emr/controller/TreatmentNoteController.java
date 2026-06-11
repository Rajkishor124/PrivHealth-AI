package com.privhealth.backend.emr.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.emr.dto.TreatmentNoteRequest;
import com.privhealth.backend.emr.dto.TreatmentNoteResponse;
import com.privhealth.backend.emr.service.TreatmentNoteService;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/treatment-notes")
@RequiredArgsConstructor
public class TreatmentNoteController {

    private final TreatmentNoteService treatmentNoteService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<TreatmentNoteResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TreatmentNoteRequest request,
            HttpServletRequest httpRequest) {
        TreatmentNoteResponse response = treatmentNoteService.create(principal, request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Treatment note created", response));
    }

    @GetMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT')")
    public ResponseEntity<ApiResponse<java.util.List<TreatmentNoteResponse>>> listByConsultation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long consultationId) {
        return ResponseEntity.ok(ApiResponse.ok(treatmentNoteService.listByConsultation(principal, consultationId)));
    }
}
