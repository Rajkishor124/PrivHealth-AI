package com.privhealth.backend.admin.controller;

import com.privhealth.backend.admin.dto.AnalyticsResponse;
import com.privhealth.backend.admin.dto.AuditLogResponse;
import com.privhealth.backend.admin.service.AdminService;
import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.user.dto.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── Doctor Approval ──

    @GetMapping("/doctors/pending")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPendingDoctors(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<UserResponse> doctors = adminService.getPendingDoctors(principal);
        return ResponseEntity.ok(ApiResponse.ok("Pending doctors retrieved", doctors));
    }

    @PutMapping("/doctors/{id}/approve")
    public ResponseEntity<ApiResponse<UserResponse>> approveDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        UserResponse doctor = adminService.approveDoctor(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Doctor approved successfully", doctor));
    }

    @PutMapping("/doctors/{id}/reject")
    public ResponseEntity<ApiResponse<UserResponse>> rejectDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        UserResponse doctor = adminService.rejectDoctor(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Doctor rejected", doctor));
    }

    // ── User Management ──

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> result = adminService.getUsers(principal, role,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", result.getContent(),
                PageMeta.from(result)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        adminService.deleteUser(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully", null));
    }

    // ── Analytics ──

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(@AuthenticationPrincipal UserPrincipal principal) {
        AnalyticsResponse analytics = adminService.getAnalytics(principal);
        return ResponseEntity.ok(ApiResponse.ok(analytics));
    }

    // ── Audit Logs ──

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLogResponse> result = adminService.getAuditLogs(principal, userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", result.getContent(),
                PageMeta.from(result)));
    }
}
