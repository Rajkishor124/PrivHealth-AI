package com.privhealth.backend.emr.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.emr.dto.ConsultationRequest;
import com.privhealth.backend.emr.dto.ConsultationResponse;
import com.privhealth.backend.emr.entity.Consultation;
import com.privhealth.backend.emr.entity.ConsultationStatus;
import com.privhealth.backend.emr.entity.ConsultationType;
import com.privhealth.backend.emr.repository.ConsultationRepository;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    @Transactional
    public ConsultationResponse create(UserPrincipal principal, ConsultationRequest request, HttpServletRequest httpRequest) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!patient.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Patient not found in your hospital");
        }
        
        if (principal.isDoctor() && !principal.getId().equals(patient.getDoctorId())) {
            throw new BadRequestException("You can only create consultations for your assigned patients");
        }

        Long doctorId = principal.isDoctor() ? principal.getId() : patient.getDoctorId();
        if (doctorId == null) {
            throw new BadRequestException("Patient must have an assigned doctor to create a consultation");
        }

        String consultationNumber = "CONS-" + principal.getHospitalId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Consultation consultation = Consultation.builder()
                .consultationNumber(consultationNumber)
                .patientId(patient.getId())
                .doctorId(doctorId)
                .hospitalId(principal.getHospitalId())
                .consultationDate(request.getConsultationDate() != null ? request.getConsultationDate() : LocalDate.now())
                .consultationType(request.getConsultationType() != null ? request.getConsultationType() : ConsultationType.GENERAL)
                .chiefComplaint(request.getChiefComplaint())
                .consultationNotes(request.getConsultationNotes())
                .status(ConsultationStatus.OPEN)
                .build();

        consultation = consultationRepository.save(consultation);

        auditService.log("CONSULTATION_CREATED", "CONSULTATION", consultation.getId(),
                "Created consultation for patient " + patient.getId(), httpRequest);

        return mapToResponse(consultation);
    }

    @Transactional(readOnly = true)
    public ConsultationResponse get(UserPrincipal principal, Long id) {
        Consultation consultation = consultationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        validateAccess(principal, consultation);

        return mapToResponse(consultation);
    }

    @Transactional(readOnly = true)
    public Page<ConsultationResponse> list(UserPrincipal principal, String search, Pageable pageable) {
        Page<Consultation> consultations;
        if (principal.isDoctor()) {
            consultations = consultationRepository.findByDoctorIdWithSearch(principal.getId(), search, pageable);
        } else if (principal.isPatient()) {
            consultations = consultationRepository.findByPatientId(principal.getId(), pageable); // Assuming patient user id maps to patient record
        } else {
            consultations = consultationRepository.findByHospitalIdWithSearch(principal.getHospitalId(), search, pageable);
        }
        return consultations.map(this::mapToResponse);
    }
    
    @Transactional
    public ConsultationResponse updateStatus(UserPrincipal principal, Long id, ConsultationStatus status, HttpServletRequest httpRequest) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));
                
        if (!consultation.getDoctorId().equals(principal.getId()) && !principal.isHospitalAdmin() && !principal.isSuperAdmin()) {
            throw new BadRequestException("Only the assigned doctor or admin can update consultation status");
        }
        validateAccess(principal, consultation);
        
        consultation.setStatus(status);
        consultation = consultationRepository.save(consultation);
        
        auditService.log("CONSULTATION_STATUS_UPDATED", "CONSULTATION", consultation.getId(),
                "Updated status to " + status, httpRequest);
                
        return mapToResponse(consultation);
    }

    private void validateAccess(UserPrincipal principal, Consultation consultation) {
        if (!consultation.getHospitalId().equals(principal.getHospitalId()) && !principal.isSuperAdmin()) {
            throw new ResourceNotFoundException("Consultation not found");
        }
        if (principal.isDoctor() && !consultation.getDoctorId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Consultation not found");
        }
        if (principal.isPatient() && !consultation.getPatient().getUserId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Consultation not found");
        }
    }

    private ConsultationResponse mapToResponse(Consultation c) {
        return ConsultationResponse.builder()
                .id(c.getId())
                .consultationNumber(c.getConsultationNumber())
                .patientId(c.getPatientId())
                .patientName(c.getPatient() != null ? c.getPatient().getFirstName() + " " + c.getPatient().getLastName() : null)
                .doctorId(c.getDoctorId())
                .doctorName(c.getDoctor() != null ? c.getDoctor().getName() : null)
                .consultationDate(c.getConsultationDate().toString())
                .consultationType(c.getConsultationType())
                .chiefComplaint(c.getChiefComplaint())
                .consultationNotes(c.getConsultationNotes())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .build();
    }
}
