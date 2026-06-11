package com.privhealth.backend.emr.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.emr.dto.DiagnosisRequest;
import com.privhealth.backend.emr.dto.DiagnosisResponse;
import com.privhealth.backend.emr.entity.Consultation;
import com.privhealth.backend.emr.entity.Diagnosis;
import com.privhealth.backend.emr.repository.ConsultationRepository;
import com.privhealth.backend.emr.repository.DiagnosisRepository;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;
    private final ConsultationRepository consultationRepository;
    private final AuditService auditService;

    @Transactional
    public DiagnosisResponse create(UserPrincipal principal, DiagnosisRequest request, HttpServletRequest httpRequest) {
        Consultation consultation = consultationRepository.findByIdWithDetails(request.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        if (!consultation.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Consultation not found in your hospital");
        }

        if (principal.isDoctor() && !consultation.getDoctorId().equals(principal.getId())) {
            throw new BadRequestException("You can only add diagnoses to your own consultations");
        }

        Diagnosis diagnosis = Diagnosis.builder()
                .consultationId(consultation.getId())
                .patientId(consultation.getPatientId())
                .doctorId(consultation.getDoctorId())
                .hospitalId(consultation.getHospitalId())
                .diagnosisCode(request.getDiagnosisCode())
                .diagnosisName(request.getDiagnosisName())
                .diagnosisDescription(request.getDiagnosisDescription())
                .severity(request.getSeverity())
                .diagnosisDate(request.getDiagnosisDate() != null ? request.getDiagnosisDate() : LocalDate.now())
                .build();

        diagnosis = diagnosisRepository.save(diagnosis);

        auditService.log("DIAGNOSIS_CREATED", "DIAGNOSIS", diagnosis.getId(),
                "Created diagnosis for consultation " + consultation.getId(), httpRequest);

        return mapToResponse(diagnosis);
    }

    @Transactional(readOnly = true)
    public List<DiagnosisResponse> listByConsultation(UserPrincipal principal, Long consultationId) {
        Consultation consultation = consultationRepository.findByIdWithDetails(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        validateAccess(principal, consultation);

        return diagnosisRepository.findByConsultationId(consultationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DiagnosisResponse> listByPatient(UserPrincipal principal, Long patientId, Pageable pageable) {
        // Assume patient access is validated at controller layer or via MedicalHistoryService
        return diagnosisRepository.findByPatientId(patientId, pageable)
                .map(this::mapToResponse);
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

    private DiagnosisResponse mapToResponse(Diagnosis d) {
        return DiagnosisResponse.builder()
                .id(d.getId())
                .consultationId(d.getConsultationId())
                .consultationNumber(d.getConsultation() != null ? d.getConsultation().getConsultationNumber() : null)
                .patientId(d.getPatientId())
                .patientName(d.getConsultation() != null && d.getConsultation().getPatient() != null ? 
                        d.getConsultation().getPatient().getFirstName() + " " + d.getConsultation().getPatient().getLastName() : null)
                .doctorId(d.getDoctorId())
                .doctorName(d.getConsultation() != null && d.getConsultation().getDoctor() != null ? 
                        d.getConsultation().getDoctor().getName() : null)
                .diagnosisCode(d.getDiagnosisCode())
                .diagnosisName(d.getDiagnosisName())
                .diagnosisDescription(d.getDiagnosisDescription())
                .severity(d.getSeverity())
                .diagnosisDate(d.getDiagnosisDate() != null ? d.getDiagnosisDate().toString() : null)
                .createdAt(d.getCreatedAt() != null ? d.getCreatedAt().toString() : null)
                .build();
    }
}
