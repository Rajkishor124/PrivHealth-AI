package com.privhealth.backend.staff.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.staff.dto.DoctorRequest;
import com.privhealth.backend.staff.dto.ReceptionistRequest;
import com.privhealth.backend.staff.dto.StaffResponse;
import com.privhealth.backend.staff.dto.TechnicianRequest;
import com.privhealth.backend.staff.service.StaffService;
import com.privhealth.backend.user.entity.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
public class StaffController {

    private final StaffService staffService;

    // --- DOCTORS ---

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<StaffResponse>> createDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorRequest request,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.createDoctor(principal, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Doctor created successfully", response));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest request,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.updateDoctor(principal, id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Doctor updated successfully", response));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> deactivateDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.deactivateStaff(principal, id, Role.DOCTOR, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Doctor deactivated successfully", response));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getDoctors(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<StaffResponse> result = staffService.getStaff(principal, Role.DOCTOR, 
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Doctors retrieved", result.getContent(), PageMeta.from(result)));
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> getDoctorById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        StaffResponse response = staffService.getStaffById(principal, id, Role.DOCTOR);
        return ResponseEntity.ok(ApiResponse.ok("Doctor retrieved", response));
    }

    // --- RECEPTIONISTS ---

    @PostMapping("/receptionists")
    public ResponseEntity<ApiResponse<StaffResponse>> createReceptionist(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReceptionistRequest request,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.createReceptionist(principal, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Receptionist created successfully", response));
    }

    @PutMapping("/receptionists/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateReceptionist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ReceptionistRequest request,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.updateReceptionist(principal, id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Receptionist updated successfully", response));
    }

    @DeleteMapping("/receptionists/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> deactivateReceptionist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.deactivateStaff(principal, id, Role.RECEPTIONIST, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Receptionist deactivated successfully", response));
    }

    @GetMapping("/receptionists")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getReceptionists(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<StaffResponse> result = staffService.getStaff(principal, Role.RECEPTIONIST, 
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Receptionists retrieved", result.getContent(), PageMeta.from(result)));
    }

    // --- TECHNICIANS ---

    @PostMapping("/technicians")
    public ResponseEntity<ApiResponse<StaffResponse>> createTechnician(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TechnicianRequest request,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.createTechnician(principal, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Technician created successfully", response));
    }

    @PutMapping("/technicians/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateTechnician(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TechnicianRequest request,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.updateTechnician(principal, id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Technician updated successfully", response));
    }

    @DeleteMapping("/technicians/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> deactivateTechnician(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        StaffResponse response = staffService.deactivateStaff(principal, id, Role.TECHNICIAN, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Technician deactivated successfully", response));
    }

    @GetMapping("/technicians")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getTechnicians(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<StaffResponse> result = staffService.getStaff(principal, Role.TECHNICIAN, 
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Technicians retrieved", result.getContent(), PageMeta.from(result)));
    }
}
