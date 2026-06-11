package com.privhealth.backend.hospital.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.ConflictException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.hospital.dto.HospitalRequest;
import com.privhealth.backend.hospital.dto.HospitalResponse;
import com.privhealth.backend.hospital.entity.Hospital;
import com.privhealth.backend.hospital.entity.HospitalStatus;
import com.privhealth.backend.hospital.repository.HospitalRepository;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final AuditService auditService;

    @Transactional
    public HospitalResponse createHospital(HospitalRequest request, HttpServletRequest httpRequest) {
        String code = generateHospitalCode(request.getName());

        Hospital hospital = Hospital.builder()
                .hospitalCode(code)
                .name(request.getName())
                .email(request.getContactEmail())
                .phone(request.getContactPhone())
                .address(request.getAddress())
                .status(HospitalStatus.ACTIVE)
                .build();

        hospital = hospitalRepository.save(hospital);

        auditService.log("HOSPITAL_CREATED", "HOSPITAL", hospital.getId(), null, httpRequest);

        return toResponse(hospital);
    }

    @Transactional(readOnly = true)
    public Page<HospitalResponse> getHospitals(Pageable pageable) {
        return hospitalRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public HospitalResponse getHospitalById(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", id));
        return toResponse(hospital);
    }

    @Transactional
    public HospitalResponse updateHospital(Long id, HospitalRequest request, HttpServletRequest httpRequest) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", id));

        hospital.setName(request.getName());
        hospital.setAddress(request.getAddress());
        hospital.setEmail(request.getContactEmail());
        hospital.setPhone(request.getContactPhone());

        hospital = hospitalRepository.save(hospital);

        auditService.log("HOSPITAL_UPDATED", "HOSPITAL", hospital.getId(), null, httpRequest);

        return toResponse(hospital);
    }

    @Transactional
    public void deleteHospital(Long id, HttpServletRequest httpRequest) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", id));

        // Soft delete or status change is better, but let's delete or mark inactive
        hospital.setStatus(HospitalStatus.INACTIVE);
        hospitalRepository.save(hospital);

        auditService.log("HOSPITAL_DEACTIVATED", "HOSPITAL", id, null, httpRequest);
    }

    private String generateHospitalCode(String name) {
        String prefix = name.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        if (prefix.length() > 3) prefix = prefix.substring(0, 3);
        String uuid = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return prefix + "-" + uuid;
    }

    private HospitalResponse toResponse(Hospital hospital) {
        return HospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .hospitalCode(hospital.getHospitalCode())
                .address(hospital.getAddress())
                .contactEmail(hospital.getEmail())
                .contactPhone(hospital.getPhone())
                .status(hospital.getStatus())
                .createdAt(hospital.getCreatedAt() != null ? hospital.getCreatedAt().toString() : null)
                .build();
    }
}
