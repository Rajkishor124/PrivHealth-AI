package com.privhealth.backend.hospital.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.hospital.dto.HospitalRequest;
import com.privhealth.backend.hospital.dto.HospitalResponse;
import com.privhealth.backend.hospital.service.HospitalService;
import com.privhealth.backend.security.UserPrincipal;
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
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> createHospital(
            @Valid @RequestBody HospitalRequest request,
            HttpServletRequest httpRequest) {
        HospitalResponse response = hospitalService.createHospital(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Hospital created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getHospitals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<HospitalResponse> result = hospitalService.getHospitals(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Hospitals retrieved", result.getContent(),
                PageMeta.from(result)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> getHospitalById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal.isHospitalAdmin() && !principal.getHospitalId().equals(id)) {
            return ResponseEntity.status(403).build();
        }
        HospitalResponse response = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(ApiResponse.ok("Hospital retrieved", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateHospital(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody HospitalRequest request,
            HttpServletRequest httpRequest) {
        if (principal.isHospitalAdmin() && !principal.getHospitalId().equals(id)) {
            return ResponseEntity.status(403).build();
        }
        HospitalResponse response = hospitalService.updateHospital(id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Hospital updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHospital(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        hospitalService.deleteHospital(id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Hospital deactivated", null));
    }
}
