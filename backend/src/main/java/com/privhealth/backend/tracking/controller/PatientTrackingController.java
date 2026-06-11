package com.privhealth.backend.tracking.controller;

import com.privhealth.backend.emr.dto.MedicalTimelineItem;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.tracking.dto.*;
import com.privhealth.backend.tracking.service.PatientTrackingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class PatientTrackingController {

    private final PatientTrackingService trackingService;
    private final PatientRepository patientRepository;

    @GetMapping("/symptoms/master")
    public ResponseEntity<List<SymptomMasterResponse>> getActiveSymptoms() {
        return ResponseEntity.ok(trackingService.getActiveSymptoms());
    }

    @PostMapping("/symptoms")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<PatientSymptomResponse> recordSymptom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PatientSymptomRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(trackingService.recordSymptom(principal, request, httpRequest));
    }

    @GetMapping("/patients/{patientId}/symptoms")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<PatientSymptomResponse>> getPatientSymptoms(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(trackingService.getPatientSymptoms(principal, patientId));
    }

    @PostMapping("/vitals")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<PatientVitalsResponse> recordVitals(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PatientVitalsRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(trackingService.recordVitals(principal, request, httpRequest));
    }

    @GetMapping("/patients/{patientId}/vitals")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<PatientVitalsResponse>> getPatientVitals(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(trackingService.getPatientVitals(principal, patientId));
    }

    @PostMapping("/journals")
    @PreAuthorize("hasAnyRole('PATIENT')")
    public ResponseEntity<HealthJournalResponse> recordJournal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HealthJournalRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(trackingService.recordJournal(principal, request, httpRequest));
    }

    @GetMapping("/patients/{patientId}/journals")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<List<HealthJournalResponse>> getPatientJournals(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(trackingService.getPatientJournals(principal, patientId));
    }

    @GetMapping("/patients/{patientId}/alerts")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<HealthAlertResponse>> getPatientAlerts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(trackingService.getPatientAlerts(principal, patientId));
    }

    @GetMapping("/hospital/alerts")
    @PreAuthorize("hasAnyRole('DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<HealthAlertResponse>> getHospitalAlerts(
            @CurrentUser UserPrincipal principal) {
        return ResponseEntity.ok(trackingService.getHospitalAlerts(principal));
    }

    @GetMapping("/patients/{patientId}/trends")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN')")
    public ResponseEntity<HealthTrendsResponse> getHealthTrends(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(trackingService.getHealthTrends(principal, patientId));
    }

    @GetMapping("/patients/{patientId}/timeline")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<MedicalTimelineItem>> getUnifiedTimeline(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(trackingService.getUnifiedTimeline(principal, patientId, httpRequest));
    }

    @GetMapping("/patients/me/timeline")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<MedicalTimelineItem>> getMyUnifiedTimeline(
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        Long patientId = patientRepository.findByUserId(principal.getId()).orElseThrow().getId();
        return ResponseEntity.ok(trackingService.getUnifiedTimeline(principal, patientId, httpRequest));
    }
}
