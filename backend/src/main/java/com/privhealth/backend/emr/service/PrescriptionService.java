package com.privhealth.backend.emr.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.emr.dto.PrescriptionMedicineDto;
import com.privhealth.backend.emr.dto.PrescriptionRequest;
import com.privhealth.backend.emr.dto.PrescriptionResponse;
import com.privhealth.backend.emr.entity.Consultation;
import com.privhealth.backend.emr.entity.Prescription;
import com.privhealth.backend.emr.entity.PrescriptionMedicine;
import com.privhealth.backend.emr.repository.ConsultationRepository;
import com.privhealth.backend.emr.repository.PrescriptionRepository;
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
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationRepository consultationRepository;
    private final AuditService auditService;

    @Transactional
    public PrescriptionResponse create(UserPrincipal principal, PrescriptionRequest request, HttpServletRequest httpRequest) {
        Consultation consultation = consultationRepository.findByIdWithDetails(request.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        if (!consultation.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Consultation not found in your hospital");
        }

        if (principal.isDoctor() && !consultation.getDoctorId().equals(principal.getId())) {
            throw new BadRequestException("You can only prescribe for your own consultations");
        }

        Prescription prescription = Prescription.builder()
                .consultationId(consultation.getId())
                .patientId(consultation.getPatientId())
                .doctorId(consultation.getDoctorId())
                .hospitalId(consultation.getHospitalId())
                .prescriptionDate(request.getPrescriptionDate() != null ? request.getPrescriptionDate() : LocalDate.now())
                .notes(request.getNotes())
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        if (request.getMedicines() != null && !request.getMedicines().isEmpty()) {
            List<PrescriptionMedicine> medicines = request.getMedicines().stream()
                    .map(m -> PrescriptionMedicine.builder()
                            .prescription(savedPrescription)
                            .medicineName(m.getMedicineName())
                            .dosage(m.getDosage())
                            .frequency(m.getFrequency())
                            .duration(m.getDuration())
                            .instructions(m.getInstructions())
                            .build())
                    .collect(Collectors.toList());
            savedPrescription.getMedicines().addAll(medicines);
        }

        Prescription prescription2 = prescriptionRepository.save(savedPrescription);

        auditService.log("PRESCRIPTION_CREATED", "PRESCRIPTION", savedPrescription.getId(),
                "Created prescription with " + savedPrescription.getMedicines().size() + " medicines for consultation " + consultation.getId(), httpRequest);

        return mapToResponse(savedPrescription);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse get(UserPrincipal principal, Long id) {
        Prescription prescription = prescriptionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
                
        validateAccess(principal, prescription.getConsultationId());
        
        return mapToResponse(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> listByConsultation(UserPrincipal principal, Long consultationId) {
        validateAccess(principal, consultationId);

        return prescriptionRepository.findByConsultationIdWithMedicines(consultationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> listByPatient(UserPrincipal principal, Long patientId, Pageable pageable) {
        return prescriptionRepository.findByPatientIdWithMedicines(patientId, pageable)
                .map(this::mapToResponse);
    }

    private void validateAccess(UserPrincipal principal, Long consultationId) {
        Consultation consultation = consultationRepository.findByIdWithDetails(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));
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

    private PrescriptionResponse mapToResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .id(p.getId())
                .consultationId(p.getConsultationId())
                .consultationNumber(p.getConsultation() != null ? p.getConsultation().getConsultationNumber() : null)
                .patientId(p.getPatientId())
                .patientName(p.getConsultation() != null && p.getConsultation().getPatient() != null ? 
                        p.getConsultation().getPatient().getFirstName() + " " + p.getConsultation().getPatient().getLastName() : null)
                .doctorId(p.getDoctorId())
                .doctorName(p.getConsultation() != null && p.getConsultation().getDoctor() != null ? 
                        p.getConsultation().getDoctor().getName() : null)
                .prescriptionDate(p.getPrescriptionDate() != null ? p.getPrescriptionDate().toString() : null)
                .notes(p.getNotes())
                .medicines(p.getMedicines().stream()
                        .map(m -> PrescriptionMedicineDto.builder()
                                .id(m.getId())
                                .medicineName(m.getMedicineName())
                                .dosage(m.getDosage())
                                .frequency(m.getFrequency())
                                .duration(m.getDuration())
                                .instructions(m.getInstructions())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .build();
    }
}
