package com.privhealth.backend.staff.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.ConflictException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.staff.dto.DoctorRequest;
import com.privhealth.backend.staff.dto.ReceptionistRequest;
import com.privhealth.backend.staff.dto.StaffResponse;
import com.privhealth.backend.staff.dto.TechnicianRequest;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.StaffStatus;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final com.privhealth.backend.subscription.service.SubscriptionService subscriptionService;

    @Transactional
    public StaffResponse createDoctor(UserPrincipal principal, DoctorRequest request, HttpServletRequest httpRequest) {
        // Enforce SaaS limit
        subscriptionService.validateAndIncrementDoctorCount(principal.getHospitalId());

        validateEmailUnique(request.getEmail());

        String password = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword() : generateRandomPassword();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .role(Role.DOCTOR)
                .staffStatus(StaffStatus.ACTIVE)
                .hospitalId(principal.getHospitalId())
                .employeeId(request.getEmployeeId())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .yearsOfExperience(request.getYearsOfExperience())
                .medicalLicenseNumber(request.getMedicalLicenseNumber())
                .joiningDate(request.getJoiningDate())
                .build();

        user = userRepository.save(user);
        auditService.log("DOCTOR_CREATED", "USER", user.getId(), "Created doctor: " + user.getEmail(), httpRequest);

        return toResponse(user);
    }

    @Transactional
    public StaffResponse updateDoctor(UserPrincipal principal, Long id, DoctorRequest request, HttpServletRequest httpRequest) {
        User user = getStaffMember(principal, id, Role.DOCTOR);

        if (!user.getEmail().equals(request.getEmail())) {
            validateEmailUnique(request.getEmail());
            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());
        user.setEmployeeId(request.getEmployeeId());
        user.setSpecialization(request.getSpecialization());
        user.setQualification(request.getQualification());
        user.setYearsOfExperience(request.getYearsOfExperience());
        user.setMedicalLicenseNumber(request.getMedicalLicenseNumber());
        user.setJoiningDate(request.getJoiningDate());

        user = userRepository.save(user);
        auditService.log("DOCTOR_UPDATED", "USER", user.getId(), null, httpRequest);

        return toResponse(user);
    }

    @Transactional
    public StaffResponse createReceptionist(UserPrincipal principal, ReceptionistRequest request, HttpServletRequest httpRequest) {
        validateEmailUnique(request.getEmail());

        String password = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword() : generateRandomPassword();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .role(Role.RECEPTIONIST)
                .staffStatus(StaffStatus.ACTIVE)
                .hospitalId(principal.getHospitalId())
                .employeeId(request.getEmployeeId())
                .department(request.getDepartment())
                .joiningDate(request.getJoiningDate())
                .build();

        user = userRepository.save(user);
        auditService.log("RECEPTIONIST_CREATED", "USER", user.getId(), "Created receptionist: " + user.getEmail(), httpRequest);

        return toResponse(user);
    }

    @Transactional
    public StaffResponse updateReceptionist(UserPrincipal principal, Long id, ReceptionistRequest request, HttpServletRequest httpRequest) {
        User user = getStaffMember(principal, id, Role.RECEPTIONIST);

        if (!user.getEmail().equals(request.getEmail())) {
            validateEmailUnique(request.getEmail());
            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());
        user.setEmployeeId(request.getEmployeeId());
        user.setDepartment(request.getDepartment());
        user.setJoiningDate(request.getJoiningDate());

        user = userRepository.save(user);
        auditService.log("RECEPTIONIST_UPDATED", "USER", user.getId(), null, httpRequest);

        return toResponse(user);
    }

    @Transactional
    public StaffResponse createTechnician(UserPrincipal principal, TechnicianRequest request, HttpServletRequest httpRequest) {
        validateEmailUnique(request.getEmail());

        String password = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword() : generateRandomPassword();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .role(Role.TECHNICIAN)
                .staffStatus(StaffStatus.ACTIVE)
                .hospitalId(principal.getHospitalId())
                .employeeId(request.getEmployeeId())
                .department(request.getDepartment())
                .joiningDate(request.getJoiningDate())
                .build();

        user = userRepository.save(user);
        auditService.log("TECHNICIAN_CREATED", "USER", user.getId(), "Created technician: " + user.getEmail(), httpRequest);

        return toResponse(user);
    }

    @Transactional
    public StaffResponse updateTechnician(UserPrincipal principal, Long id, TechnicianRequest request, HttpServletRequest httpRequest) {
        User user = getStaffMember(principal, id, Role.TECHNICIAN);

        if (!user.getEmail().equals(request.getEmail())) {
            validateEmailUnique(request.getEmail());
            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());
        user.setEmployeeId(request.getEmployeeId());
        user.setDepartment(request.getDepartment());
        user.setJoiningDate(request.getJoiningDate());

        user = userRepository.save(user);
        auditService.log("TECHNICIAN_UPDATED", "USER", user.getId(), null, httpRequest);

        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<StaffResponse> getStaff(UserPrincipal principal, Role role, Pageable pageable) {
        if (principal.isSuperAdmin()) {
            return userRepository.findByRole(role, pageable).map(this::toResponse);
        } else {
            return userRepository.findByRoleAndHospitalId(role, principal.getHospitalId(), pageable).map(this::toResponse);
        }
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaffById(UserPrincipal principal, Long id, Role role) {
        return toResponse(getStaffMember(principal, id, role));
    }

    @Transactional
    public StaffResponse deactivateStaff(UserPrincipal principal, Long id, Role role, HttpServletRequest httpRequest) {
        User user = getStaffMember(principal, id, role);
        user.setStaffStatus(StaffStatus.INACTIVE);
        user = userRepository.save(user);

        auditService.log(role.name() + "_DEACTIVATED", "USER", user.getId(), null, httpRequest);
        return toResponse(user);
    }

    private User getStaffMember(UserPrincipal principal, Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member", id));

        if (user.getRole() != role) {
            throw new ResourceNotFoundException("Staff member", id);
        }

        if (!principal.isSuperAdmin() && !user.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Staff member", id);
        }

        return user;
    }

    private void validateEmailUnique(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 12) + "A1!";
    }

    private StaffResponse toResponse(User user) {
        return StaffResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStaffStatus())
                .employeeId(user.getEmployeeId())
                .specialization(user.getSpecialization())
                .qualification(user.getQualification())
                .yearsOfExperience(user.getYearsOfExperience())
                .medicalLicenseNumber(user.getMedicalLicenseNumber())
                .department(user.getDepartment())
                .designation(user.getDesignation())
                .joiningDate(user.getJoiningDate())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
