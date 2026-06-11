package com.privhealth.backend.emr.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.emr.dto.MedicalTimelineItem;
import com.privhealth.backend.emr.service.MedicalHistoryService;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;
    private final PatientRepository patientRepository;

    @GetMapping("/{id}/medical-history")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<MedicalTimelineItem>>> getPatientHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Medical history retrieved", medicalHistoryService.getTimeline(principal, id)));
    }

    @GetMapping("/me/history")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<MedicalTimelineItem>>> getMyHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        Patient patient = patientRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new com.privhealth.backend.common.exception.ResourceNotFoundException("Patient profile not found"));
        return ResponseEntity.ok(ApiResponse.ok("Medical history retrieved", medicalHistoryService.getTimeline(principal, patient.getId())));
    }
}
