package com.privhealth.backend.patient.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.*;
import com.privhealth.backend.patient.dto.*;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.entity.PatientStatus;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.prediction.entity.RiskCategory;
import com.privhealth.backend.prediction.repository.PredictionRepository;
import com.privhealth.backend.privacy.encryption.EncryptionService;
import com.privhealth.backend.privacy.hmac.HmacService;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;
    private final EncryptionService encryptionService;
    private final HmacService hmacService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final com.privhealth.backend.subscription.service.SubscriptionService subscriptionService;

    @Transactional
    public PatientResponse create(UserPrincipal principal, PatientRequest request, HttpServletRequest httpRequest) {
        if (!principal.isSuperAdmin() && principal.getHospitalId() == null) {
            throw new AccessDeniedException("Must belong to a hospital");
        }

        // Validate and increment patient count (SaaS limit)
        subscriptionService.validateAndIncrementPatientCount(principal.getHospitalId());

        Long doctorId = request.getDoctorId();
        if (doctorId != null) {
            User doctor = userRepository.findById(doctorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));
            if (doctor.getRole() != Role.DOCTOR || !doctor.getHospitalId().equals(principal.getHospitalId())) {
                throw new BadRequestException("Invalid doctor assigned");
            }
        }

        String generatedPassword = UUID.randomUUID().toString().substring(0, 8);
        User patientUser = null;

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new ConflictException("Email already in use");
            }
            patientUser = User.builder()
                    .name(request.getFirstName() + " " + request.getLastName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(generatedPassword))
                    .role(Role.PATIENT)
                    .hospitalId(principal.getHospitalId())
                    .build();
            patientUser = userRepository.save(patientUser);
        } else {
            throw new BadRequestException("Email is required for patient login account");
        }

        String rawMedicalHistory = serializeMedicalHistory(request);
        String encrypted = encryptionService.encrypt(rawMedicalHistory);
        String hmac = hmacService.sign(rawMedicalHistory);

        Patient patient = Patient.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .status(PatientStatus.ACTIVE)
                .doctorId(doctorId)
                .userId(patientUser.getId())
                .hospitalId(principal.getHospitalId())
                .encryptedMedicalHistory(encrypted)
                .medicalHistoryHmac(hmac)
                .build();

        patient = patientRepository.save(patient);

        auditService.log("PATIENT_CREATED", "PATIENT", patient.getId(), null, httpRequest);
        if (doctorId != null) {
            auditService.log("DOCTOR_ASSIGNED", "PATIENT", patient.getId(), "Doctor ID: " + doctorId, httpRequest);
        }

        PatientResponse response = toResponse(patient, rawMedicalHistory);
        response.setTemporaryPassword(generatedPassword);
        return response;
    }

    @Transactional(readOnly = true)
    public Page<PatientSummaryResponse> list(UserPrincipal principal, String search, Pageable pageable) {
        Page<Patient> patients;

        if (principal.isSuperAdmin()) {
            patients = patientRepository.findAllWithSearch(search, pageable);
        } else if (principal.getHospitalId() != null) {
            if (principal.isDoctor()) {
                patients = patientRepository.findByDoctorIdWithSearch(principal.getId(), search, pageable);
            } else {
                patients = patientRepository.findByHospitalIdWithSearch(principal.getHospitalId(), search, pageable);
            }
        } else {
            throw new AccessDeniedException("Access denied");
        }

        return mapToSummaryPage(patients);
    }

    @Transactional(readOnly = true)
    public PatientResponse get(UserPrincipal principal, Long id) {
        Patient patient = patientRepository.findByIdWithDoctor(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));

        authorizeAccess(principal, patient);

        String decrypted = encryptionService.decrypt(patient.getEncryptedMedicalHistory());
        hmacService.verify(decrypted, patient.getMedicalHistoryHmac());

        return toResponse(patient, decrypted);
    }

    @Transactional(readOnly = true)
    public PatientResponse getMyProfile(UserPrincipal principal) {
        Patient patient = patientRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", principal.getId()));

        String decrypted = encryptionService.decrypt(patient.getEncryptedMedicalHistory());
        hmacService.verify(decrypted, patient.getMedicalHistoryHmac());

        return toResponse(patient, decrypted);
    }

    @Transactional
    public PatientResponse update(UserPrincipal principal, Long id, PatientRequest request, HttpServletRequest httpRequest) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));

        authorizeAccess(principal, patient);

        if (principal.isDoctor() && !patient.getDoctorId().equals(principal.getId())) {
            throw new AccessDeniedException("Not assigned to this patient");
        }

        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());

        // We do not update email directly because it is tied to user account.
        // User account email update might be a separate flow.
        // However, we can update the patient's record email if desired, but let's keep it tied to request.getEmail() safely.
        if (request.getEmail() != null && !request.getEmail().equals(patient.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new ConflictException("Email already in use");
            }
            patient.setEmail(request.getEmail());
            // Optionally update User email
            userRepository.findById(patient.getUserId()).ifPresent(u -> {
                u.setEmail(request.getEmail());
                userRepository.save(u);
            });
        }

        String rawMedicalHistory = serializeMedicalHistory(request);
        patient.setEncryptedMedicalHistory(encryptionService.encrypt(rawMedicalHistory));
        patient.setMedicalHistoryHmac(hmacService.sign(rawMedicalHistory));

        patient = patientRepository.save(patient);

        auditService.log("PATIENT_UPDATED", "PATIENT", patient.getId(), null, httpRequest);

        return toResponse(patient, rawMedicalHistory);
    }

    @Transactional
    public PatientResponse updateProfile(UserPrincipal principal, PatientSelfUpdateRequest request, HttpServletRequest httpRequest) {
        Patient patient = patientRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile", principal.getId()));

        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());

        patient = patientRepository.save(patient);
        auditService.log("PROFILE_UPDATED", "PATIENT", patient.getId(), null, httpRequest);

        String decrypted = encryptionService.decrypt(patient.getEncryptedMedicalHistory());
        return toResponse(patient, decrypted);
    }

    @Transactional
    public void assignDoctor(UserPrincipal principal, Long id, AssignDoctorRequest request, HttpServletRequest httpRequest) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));

        if (!principal.isSuperAdmin() && !patient.getHospitalId().equals(principal.getHospitalId())) {
            throw new AccessDeniedException("Patient belongs to another hospital");
        }

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", request.getDoctorId()));

        if (doctor.getRole() != Role.DOCTOR || !doctor.getHospitalId().equals(patient.getHospitalId())) {
            throw new BadRequestException("Invalid doctor assigned");
        }

        patient.setDoctorId(doctor.getId());
        patientRepository.save(patient);

        auditService.log("DOCTOR_ASSIGNED", "PATIENT", patient.getId(), "Assigned to doctor: " + doctor.getId(), httpRequest);
    }

    @Transactional
    public void delete(UserPrincipal principal, Long id, HttpServletRequest httpRequest) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));

        authorizeAccess(principal, patient);

        patient.setStatus(PatientStatus.INACTIVE);
        patientRepository.save(patient);

        auditService.log("PATIENT_DEACTIVATED", "PATIENT", id, null, httpRequest);
    }

    private void authorizeAccess(UserPrincipal principal, Patient patient) {
        if (principal.isSuperAdmin()) return;

        if (principal.getHospitalId() == null || !principal.getHospitalId().equals(patient.getHospitalId())) {
            throw new ResourceNotFoundException("Patient", patient.getId());
        }

        if (principal.isPatient()) {
            if (patient.getUserId() != null && patient.getUserId().equals(principal.getId())) {
                return;
            }
            throw new ResourceNotFoundException("Patient", patient.getId());
        }

        if (principal.isDoctor() && (patient.getDoctorId() == null || !patient.getDoctorId().equals(principal.getId()))) {
            throw new AccessDeniedException("Not assigned to this patient");
        }
    }

    private String serializeMedicalHistory(PatientRequest request) {
        try {
            MedicalHistoryDto dto = MedicalHistoryDto.builder()
                    .height(request.getHeight())
                    .weight(request.getWeight())
                    .allergies(request.getAllergies())
                    .existingConditions(request.getExistingConditions())
                    .build();
            return objectMapper.writeValueAsString(dto);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize medical history", e);
        }
    }

    private PatientResponse toResponse(Patient patient, String decryptedHistory) {
        String doctorName = null;
        if (patient.getDoctor() != null) {
            doctorName = patient.getDoctor().getName();
        } else if (patient.getDoctorId() != null) {
            doctorName = userRepository.findById(patient.getDoctorId())
                    .map(User::getName).orElse(null);
        }

        MedicalHistoryDto medicalHistoryDto = null;
        try {
            medicalHistoryDto = objectMapper.readValue(decryptedHistory, MedicalHistoryDto.class);
        } catch (Exception e) {
            // Fallback if legacy string
            medicalHistoryDto = MedicalHistoryDto.builder()
                    .existingConditions(decryptedHistory)
                    .build();
        }

        return PatientResponse.builder()
                .id(patient.getId())
                .doctorId(patient.getDoctorId())
                .doctorName(doctorName)
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .status(patient.getStatus())
                .height(medicalHistoryDto.getHeight())
                .weight(medicalHistoryDto.getWeight())
                .allergies(medicalHistoryDto.getAllergies())
                .existingConditions(medicalHistoryDto.getExistingConditions())
                .createdAt(patient.getCreatedAt() != null ? patient.getCreatedAt().toString() : null)
                .build();
    }

    private Page<PatientSummaryResponse> mapToSummaryPage(Page<Patient> patients) {
        return patients.map(p -> {
            RiskCategory lastRisk = predictionRepository
                    .findTopByPatientIdOrderByCreatedAtDesc(p.getId())
                    .map(pred -> pred.getRiskCategory())
                    .orElse(null);

            return PatientSummaryResponse.builder()
                    .id(p.getId())
                    .firstName(p.getFirstName())
                    .lastName(p.getLastName())
                    .dateOfBirth(p.getDateOfBirth())
                    .gender(p.getGender())
                    .phone(p.getPhone())
                    .status(p.getStatus())
                    .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                    .lastRiskCategory(lastRisk)
                    .build();
        });
    }
}
