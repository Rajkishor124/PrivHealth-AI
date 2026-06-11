package com.privhealth.backend.appointment.controller;

import com.privhealth.backend.appointment.dto.AppointmentAnalyticsResponse;
import com.privhealth.backend.appointment.dto.PatientQueueResponse;
import com.privhealth.backend.appointment.dto.QueueDashboardResponse;
import com.privhealth.backend.appointment.service.PatientQueueService;
import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class PatientQueueController {

    private final PatientQueueService queueService;

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<PatientQueueResponse>>> getDoctorQueue(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PatientQueueResponse> response = queueService.getDoctorQueue(principal);
        return ResponseEntity.ok(ApiResponse.ok("Queue retrieved", response));
    }

    @GetMapping("/doctor/me/dashboard")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<QueueDashboardResponse>> getDoctorDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        QueueDashboardResponse response = queueService.getDoctorDashboard(principal);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard retrieved", response));
    }

    @PostMapping("/call-next")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientQueueResponse>> callNext(
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        PatientQueueResponse response = queueService.callNext(principal, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Patient called", response));
    }

    @PostMapping("/{id}/start-consultation")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientQueueResponse>> startConsultation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        PatientQueueResponse response = queueService.startConsultation(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Consultation started", response));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientQueueResponse>> complete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        PatientQueueResponse response = queueService.complete(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Consultation completed", response));
    }

    @PostMapping("/{id}/skip")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientQueueResponse>> skip(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        PatientQueueResponse response = queueService.skip(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Patient skipped", response));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentAnalyticsResponse>> getAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        AppointmentAnalyticsResponse response = queueService.getHospitalAnalytics(principal);
        return ResponseEntity.ok(ApiResponse.ok("Analytics retrieved", response));
    }
}
