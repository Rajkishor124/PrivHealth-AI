package com.privhealth.backend.emr.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.emr.dto.TreatmentNoteRequest;
import com.privhealth.backend.emr.dto.TreatmentNoteResponse;
import com.privhealth.backend.emr.entity.Consultation;
import com.privhealth.backend.emr.entity.TreatmentNote;
import com.privhealth.backend.emr.repository.ConsultationRepository;
import com.privhealth.backend.emr.repository.TreatmentNoteRepository;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TreatmentNoteService {

    private final TreatmentNoteRepository treatmentNoteRepository;
    private final ConsultationRepository consultationRepository;
    private final AuditService auditService;

    @Transactional
    public TreatmentNoteResponse create(UserPrincipal principal, TreatmentNoteRequest request, HttpServletRequest httpRequest) {
        Consultation consultation = consultationRepository.findByIdWithDetails(request.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        if (!consultation.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Consultation not found in your hospital");
        }

        if (principal.isDoctor() && !consultation.getDoctorId().equals(principal.getId())) {
            throw new BadRequestException("You can only add notes to your own consultations");
        }

        TreatmentNote note = TreatmentNote.builder()
                .consultationId(consultation.getId())
                .doctorId(consultation.getDoctorId())
                .patientId(consultation.getPatientId())
                .hospitalId(consultation.getHospitalId())
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        note = treatmentNoteRepository.save(note);

        auditService.log("TREATMENT_NOTE_CREATED", "TREATMENT_NOTE", note.getId(),
                "Created note for consultation " + consultation.getId(), httpRequest);

        return mapToResponse(note, consultation);
    }

    @Transactional(readOnly = true)
    public List<TreatmentNoteResponse> listByConsultation(UserPrincipal principal, Long consultationId) {
        Consultation consultation = consultationRepository.findByIdWithDetails(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        validateAccess(principal, consultation);

        return treatmentNoteRepository.findByConsultationId(consultationId).stream()
                .map(note -> mapToResponse(note, consultation))
                .collect(Collectors.toList());
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

    private TreatmentNoteResponse mapToResponse(TreatmentNote note, Consultation c) {
        return TreatmentNoteResponse.builder()
                .id(note.getId())
                .consultationId(note.getConsultationId())
                .consultationNumber(c != null ? c.getConsultationNumber() : null)
                .doctorId(note.getDoctorId())
                .doctorName(c != null && c.getDoctor() != null ? c.getDoctor().getName() : null)
                .patientId(note.getPatientId())
                .title(note.getTitle())
                .description(note.getDescription())
                .createdAt(note.getCreatedAt() != null ? note.getCreatedAt().toString() : null)
                .build();
    }
}
