package com.privhealth.backend.appointment.controller;

import com.privhealth.backend.appointment.dto.AppointmentRequest;
import com.privhealth.backend.appointment.dto.AppointmentResponse;
import com.privhealth.backend.appointment.dto.RescheduleRequest;
import com.privhealth.backend.appointment.service.AppointmentService;
import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AppointmentRequest request,
            HttpServletRequest httpRequest) {
        AppointmentResponse response = appointmentService.create(principal, request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Appointment booked successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status) {
        Page<AppointmentResponse> result = appointmentService.list(principal, date, status,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appointmentDate")));
        return ResponseEntity.ok(ApiResponse.ok("Appointments retrieved", result.getContent(),
                PageMeta.from(result)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        AppointmentResponse response = appointmentService.get(principal, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> reschedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            HttpServletRequest httpRequest) {
        AppointmentResponse response = appointmentService.reschedule(principal, id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Appointment rescheduled", response));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        AppointmentResponse response = appointmentService.cancel(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Appointment cancelled", response));
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> checkIn(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        AppointmentResponse response = appointmentService.checkIn(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Patient checked in", response));
    }

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String date) {
        LocalDate scheduleDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        List<AppointmentResponse> response = appointmentService.getDoctorAppointments(principal, scheduleDate);
        return ResponseEntity.ok(ApiResponse.ok("Doctor schedule retrieved", response));
    }

    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AppointmentResponse> result = appointmentService.getMyAppointments(principal,
                PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok("Appointments retrieved", result.getContent(),
                PageMeta.from(result)));
    }
}
