package com.privhealth.backend.emr.service;

import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.emr.dto.MedicalTimelineItem;
import com.privhealth.backend.emr.entity.*;
import com.privhealth.backend.emr.repository.*;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalHistoryService {

    private final ConsultationRepository consultationRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final TreatmentNoteRepository treatmentNoteRepository;
    private final MedicalReportRepository medicalReportRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<MedicalTimelineItem> getTimeline(UserPrincipal principal, Long patientId) {
        Patient patient = patientRepository.findByIdWithDoctor(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!patient.getHospitalId().equals(principal.getHospitalId()) && !principal.isSuperAdmin()) {
            throw new ResourceNotFoundException("Patient not found");
        }
        if (principal.isDoctor() && !patient.getDoctorId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Patient not found");
        }
        if (principal.isPatient() && !patient.getUserId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Patient not found");
        }

        List<MedicalTimelineItem> timeline = new ArrayList<>();
        String doctorName = patient.getDoctor() != null ? patient.getDoctor().getName() : "Unknown Doctor";

        PageRequest pageRequest = PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Add Consultations
        List<Consultation> consultations = consultationRepository.findByPatientId(patientId, pageRequest).getContent();
        for (Consultation c : consultations) {
            timeline.add(MedicalTimelineItem.builder()
                    .type("CONSULTATION")
                    .id(c.getId())
                    .title("Consultation: " + c.getConsultationType())
                    .description(c.getChiefComplaint())
                    .doctorName(c.getDoctor() != null ? c.getDoctor().getName() : doctorName)
                    .date(c.getConsultationDate().toString())
                    .build());
        }

        // Add Diagnoses
        List<Diagnosis> diagnoses = diagnosisRepository.findByPatientId(patientId, pageRequest).getContent();
        for (Diagnosis d : diagnoses) {
            timeline.add(MedicalTimelineItem.builder()
                    .type("DIAGNOSIS")
                    .id(d.getId())
                    .title(d.getDiagnosisCode() != null ? "[" + d.getDiagnosisCode() + "] " + d.getDiagnosisName() : d.getDiagnosisName())
                    .description("Severity: " + d.getSeverity())
                    .doctorName(doctorName)
                    .date(d.getDiagnosisDate().toString())
                    .build());
        }

        // Add Prescriptions
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdWithMedicines(patientId, pageRequest).getContent();
        for (Prescription p : prescriptions) {
            timeline.add(MedicalTimelineItem.builder()
                    .type("PRESCRIPTION")
                    .id(p.getId())
                    .title("Prescription (" + p.getMedicines().size() + " medicines)")
                    .description(p.getMedicines().stream().map(PrescriptionMedicine::getMedicineName).collect(Collectors.joining(", ")))
                    .doctorName(doctorName)
                    .date(p.getPrescriptionDate().toString())
                    .build());
        }

        // Add Notes
        List<TreatmentNote> notes = treatmentNoteRepository.findByPatientId(patientId, pageRequest).getContent();
        for (TreatmentNote t : notes) {
            timeline.add(MedicalTimelineItem.builder()
                    .type("TREATMENT_NOTE")
                    .id(t.getId())
                    .title(t.getTitle())
                    .description(t.getDescription() != null && t.getDescription().length() > 50 ? t.getDescription().substring(0, 50) + "..." : t.getDescription())
                    .doctorName(doctorName)
                    .date(t.getCreatedAt().toString().split("T")[0])
                    .build());
        }

        // Add Reports
        List<MedicalReport> reports = medicalReportRepository.findByPatientId(patientId, pageRequest).getContent();
        for (MedicalReport r : reports) {
            timeline.add(MedicalTimelineItem.builder()
                    .type("REPORT")
                    .id(r.getId())
                    .title(r.getReportTitle() + " (" + r.getReportType() + ")")
                    .description(r.getSummary() != null && r.getSummary().length() > 50 ? r.getSummary().substring(0, 50) + "..." : r.getSummary())
                    .doctorName(doctorName)
                    .date(r.getReportDate().toString())
                    .build());
        }

        // Sort descending by date
        timeline.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        return timeline;
    }
}
