package com.privhealth.backend.tracking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.privhealth.backend.appointment.entity.Appointment;
import com.privhealth.backend.appointment.repository.AppointmentRepository;
import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.emr.dto.MedicalTimelineItem;
import com.privhealth.backend.emr.service.MedicalHistoryService;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.privacy.encryption.EncryptionService;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.tracking.dto.*;
import com.privhealth.backend.tracking.entity.*;
import com.privhealth.backend.tracking.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientTrackingService {

    private final SymptomMasterRepository symptomMasterRepository;
    private final PatientSymptomRepository patientSymptomRepository;
    private final PatientVitalsRepository patientVitalsRepository;
    private final HealthJournalRepository healthJournalRepository;
    private final HealthAlertRepository healthAlertRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalHistoryService medicalHistoryService;
    private final AuditService auditService;
    private final EncryptionService encryptionService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<SymptomMasterResponse> getActiveSymptoms() {
        return symptomMasterRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(s -> SymptomMasterResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .category(s.getCategory())
                        .description(s.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientSymptomResponse recordSymptom(UserPrincipal principal, PatientSymptomRequest request, HttpServletRequest httpRequest) {
        Long targetPatientId = request.getPatientId();
        if (principal.isPatient()) {
            targetPatientId = patientRepository.findByUserId(principal.getId())
                    .map(Patient::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        }

        Patient patient = validateAndAuthorize(principal, targetPatientId);
        SymptomMaster symptom = symptomMasterRepository.findById(request.getSymptomId())
                .orElseThrow(() -> new ResourceNotFoundException("Symptom", request.getSymptomId()));

        PatientSymptom ps = PatientSymptom.builder()
                .patientId(patient.getId())
                .hospitalId(patient.getHospitalId())
                .symptomId(symptom.getId())
                .severity(request.getSeverity())
                .notes(request.getNotes())
                .build();

        ps = patientSymptomRepository.save(ps);
        auditService.log("SYMPTOM_ADDED", "PATIENT", patient.getId(), "Symptom: " + symptom.getName(), httpRequest);

        return buildSymptomResponse(ps, symptom);
    }

    @Transactional(readOnly = true)
    public List<PatientSymptomResponse> getPatientSymptoms(UserPrincipal principal, Long patientId) {
        Patient patient = validateAndAuthorize(principal, patientId);
        return patientSymptomRepository.findByPatientId(patient.getId(), PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "recordedAt")))
                .stream()
                .map(ps -> buildSymptomResponse(ps, ps.getSymptom()))
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientVitalsResponse recordVitals(UserPrincipal principal, PatientVitalsRequest request, HttpServletRequest httpRequest) {
        Long targetPatientId = request.getPatientId();
        if (principal.isPatient()) {
            targetPatientId = patientRepository.findByUserId(principal.getId())
                    .map(Patient::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        }

        Patient patient = validateAndAuthorize(principal, targetPatientId);

        Double h = request.getHeight();
        Double w = request.getWeight();

        // Fallback to previous vitals
        if (h == null || w == null) {
            Optional<PatientVitals> lastVitals = patientVitalsRepository.findFirstByPatientIdOrderByRecordedAtDesc(patient.getId());
            if (lastVitals.isPresent()) {
                if (h == null) h = lastVitals.get().getHeight();
                if (w == null) w = lastVitals.get().getWeight();
            }
        }

        // Fallback to profile
        if (h == null || w == null) {
            try {
                String decrypted = encryptionService.decrypt(patient.getEncryptedMedicalHistory());
                JsonNode historyNode = objectMapper.readTree(decrypted);
                if (h == null && historyNode.has("height") && !historyNode.get("height").isNull()) {
                    h = historyNode.get("height").asDouble();
                }
                if (w == null && historyNode.has("weight") && !historyNode.get("weight").isNull()) {
                    w = historyNode.get("weight").asDouble();
                }
            } catch (Exception e) {
                log.warn("Failed to read medical history for BMI calculation fallback", e);
            }
        }

        PatientVitals pv = PatientVitals.builder()
                .patientId(patient.getId())
                .hospitalId(patient.getHospitalId())
                .bloodPressureSystolic(request.getBloodPressureSystolic())
                .bloodPressureDiastolic(request.getBloodPressureDiastolic())
                .heartRate(request.getHeartRate())
                .oxygenSaturation(request.getOxygenSaturation())
                .temperature(request.getTemperature())
                .bloodSugar(request.getBloodSugar())
                .weight(w)
                .height(h)
                .build();

        // calculateBmi() runs automatically via @PrePersist, but we can do it here just to be sure
        if (w != null && h != null && h > 0) {
            double heightInMeters = h / 100.0;
            pv.setBmi(w / (heightInMeters * heightInMeters));
        }

        pv = patientVitalsRepository.save(pv);
        auditService.log("VITALS_ADDED", "PATIENT", patient.getId(), "Vitals recorded", httpRequest);

        // Rule Engine Evaluation
        evaluateVitalsRules(pv, httpRequest);

        return buildVitalsResponse(pv);
    }

    private void evaluateVitalsRules(PatientVitals pv, HttpServletRequest httpRequest) {
        if (pv.getBloodPressureSystolic() != null && pv.getBloodPressureSystolic() > 180) {
            createAlert(pv.getPatientId(), pv.getHospitalId(), "BLOOD_PRESSURE", AlertSeverity.CRITICAL, "Critical high blood pressure detected: " + pv.getBloodPressureSystolic() + " mmHg", httpRequest);
        }
        if (pv.getBloodSugar() != null && pv.getBloodSugar() > 300) {
            createAlert(pv.getPatientId(), pv.getHospitalId(), "BLOOD_SUGAR", AlertSeverity.HIGH, "High blood sugar level detected: " + pv.getBloodSugar() + " mg/dL", httpRequest);
        }
        if (pv.getHeartRate() != null && pv.getHeartRate() > 140) {
            createAlert(pv.getPatientId(), pv.getHospitalId(), "HEART_RATE", AlertSeverity.HIGH, "Abnormal high heart rate detected: " + pv.getHeartRate() + " bpm", httpRequest);
        }
        if (pv.getOxygenSaturation() != null && pv.getOxygenSaturation() < 90) {
            createAlert(pv.getPatientId(), pv.getHospitalId(), "OXYGEN_SATURATION", AlertSeverity.CRITICAL, "Critical low oxygen saturation detected: " + pv.getOxygenSaturation() + "%", httpRequest);
        }
    }

    private void createAlert(Long patientId, Long hospitalId, String type, AlertSeverity severity, String message, HttpServletRequest httpRequest) {
        HealthAlert alert = HealthAlert.builder()
                .patientId(patientId)
                .hospitalId(hospitalId)
                .alertType(type)
                .severity(severity)
                .message(message)
                .build();
        healthAlertRepository.save(alert);
        auditService.log("HEALTH_ALERT_GENERATED", "PATIENT", patientId, message, httpRequest);
    }

    @Transactional(readOnly = true)
    public List<PatientVitalsResponse> getPatientVitals(UserPrincipal principal, Long patientId) {
        Patient patient = validateAndAuthorize(principal, patientId);
        return patientVitalsRepository.findByPatientIdOrderByRecordedAtAsc(patient.getId()).stream()
                .map(this::buildVitalsResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HealthJournalResponse recordJournal(UserPrincipal principal, HealthJournalRequest request, HttpServletRequest httpRequest) {
        Long targetPatientId = request.getPatientId();
        if (principal.isPatient()) {
            targetPatientId = patientRepository.findByUserId(principal.getId())
                    .map(Patient::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        }

        Patient patient = validateAndAuthorize(principal, targetPatientId);

        HealthJournal hj = HealthJournal.builder()
                .patientId(patient.getId())
                .hospitalId(patient.getHospitalId())
                .title(request.getTitle())
                .description(request.getDescription())
                .mood(request.getMood())
                .build();

        hj = healthJournalRepository.save(hj);
        auditService.log("JOURNAL_CREATED", "PATIENT", patient.getId(), "Journal title: " + hj.getTitle(), httpRequest);

        return buildJournalResponse(hj);
    }

    @Transactional(readOnly = true)
    public List<HealthJournalResponse> getPatientJournals(UserPrincipal principal, Long patientId) {
        Patient patient = validateAndAuthorize(principal, patientId);
        return healthJournalRepository.findByPatientId(patient.getId(), PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(this::buildJournalResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HealthAlertResponse> getPatientAlerts(UserPrincipal principal, Long patientId) {
        Patient patient = validateAndAuthorize(principal, patientId);
        return healthAlertRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId()).stream()
                .map(a -> HealthAlertResponse.builder()
                        .id(a.getId())
                        .patientId(a.getPatientId())
                        .patientName(a.getPatient().getFirstName() + " " + a.getPatient().getLastName())
                        .alertType(a.getAlertType())
                        .severity(a.getSeverity())
                        .message(a.getMessage())
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HealthAlertResponse> getHospitalAlerts(UserPrincipal principal) {
        if (!principal.isHospitalAdmin() && !principal.isSuperAdmin() && !principal.isDoctor()) {
            throw new AccessDeniedException("Unauthorized");
        }
        return healthAlertRepository.findByHospitalId(principal.getHospitalId(), PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(a -> HealthAlertResponse.builder()
                        .id(a.getId())
                        .patientId(a.getPatientId())
                        .patientName(a.getPatient().getFirstName() + " " + a.getPatient().getLastName())
                        .alertType(a.getAlertType())
                        .severity(a.getSeverity())
                        .message(a.getMessage())
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HealthTrendsResponse getHealthTrends(UserPrincipal principal, Long patientId) {
        Patient patient = validateAndAuthorize(principal, patientId);
        
        List<PatientVitalsResponse> vitals = patientVitalsRepository.findByPatientIdOrderByRecordedAtAsc(patient.getId()).stream()
                .map(this::buildVitalsResponse)
                .collect(Collectors.toList());

        List<PatientSymptom> symptoms = patientSymptomRepository.findByPatientId(patient.getId(), PageRequest.of(0, 1000)).getContent();
        Map<String, Long> frequencies = symptoms.stream()
                .collect(Collectors.groupingBy(ps -> ps.getSymptom().getName(), Collectors.counting()));

        return HealthTrendsResponse.builder()
                .vitalsHistory(vitals)
                .symptomFrequencies(frequencies)
                .build();
    }

    @Transactional
    public List<MedicalTimelineItem> getUnifiedTimeline(UserPrincipal principal, Long patientId, HttpServletRequest httpRequest) {
        Patient patient = validateAndAuthorize(principal, patientId);
        auditService.log("TIMELINE_VIEWED", "PATIENT", patient.getId(), "Unified timeline viewed", httpRequest);

        // Fetch EMR items
        List<MedicalTimelineItem> timeline = new ArrayList<>(medicalHistoryService.getTimeline(principal, patient.getId()));

        PageRequest pageRequest = PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Appointments
        List<Appointment> appointments = appointmentRepository.findByPatientId(patient.getId(), pageRequest).getContent();
        for (Appointment a : appointments) {
            timeline.add(MedicalTimelineItem.builder()
                    .type("APPOINTMENT")
                    .id(a.getId())
                    .title("Appointment: " + a.getStatus())
                    .description("Reason: " + a.getReasonForVisit())
                    .doctorName(a.getDoctor() != null ? a.getDoctor().getName() : "Unknown")
                    .date(a.getAppointmentDate().toString() + " " + a.getAppointmentTime().toString())
                    .build());
        }

        // Symptoms
        List<PatientSymptom> symptoms = patientSymptomRepository.findByPatientId(patient.getId(), pageRequest).getContent();
        for (PatientSymptom s : symptoms) {
            timeline.add(MedicalTimelineItem.builder()
                    .type("SYMPTOM")
                    .id(s.getId())
                    .title("Symptom: " + s.getSymptom().getName() + " (" + s.getSeverity() + ")")
                    .description(s.getNotes() != null ? s.getNotes() : "")
                    .doctorName("Self Reported")
                    .date(s.getRecordedAt().toString())
                    .build());
        }

        // Vitals
        List<PatientVitals> vitals = patientVitalsRepository.findByPatientId(patient.getId(), PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "recordedAt"))).getContent();
        for (PatientVitals v : vitals) {
            String details = "BP: " + (v.getBloodPressureSystolic() != null ? v.getBloodPressureSystolic() + "/" + v.getBloodPressureDiastolic() : "N/A") +
                    ", HR: " + (v.getHeartRate() != null ? v.getHeartRate() : "N/A") +
                    ", Sugar: " + (v.getBloodSugar() != null ? v.getBloodSugar() : "N/A") +
                    ", O2: " + (v.getOxygenSaturation() != null ? v.getOxygenSaturation() + "%" : "N/A");
            timeline.add(MedicalTimelineItem.builder()
                    .type("VITALS")
                    .id(v.getId())
                    .title("Vitals Recorded")
                    .description(details)
                    .doctorName("Self Reported")
                    .date(v.getRecordedAt().toString())
                    .build());
        }

        // Journals
        List<HealthJournal> journals = healthJournalRepository.findByPatientId(patient.getId(), pageRequest).getContent();
        for (HealthJournal j : journals) {
            timeline.add(MedicalTimelineItem.builder()
                    .type("JOURNAL")
                    .id(j.getId())
                    .title("Journal: " + j.getTitle())
                    .description(j.getDescription())
                    .doctorName("Self Reported")
                    .date(j.getCreatedAt().toString())
                    .build());
        }

        // Re-sort everything globally by Date string parsing
        timeline.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        return timeline;
    }

    private Patient validateAndAuthorize(UserPrincipal principal, Long patientId) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        if (principal.isSuperAdmin()) {
            return patient;
        }

        if (principal.getHospitalId() == null || !principal.getHospitalId().equals(patient.getHospitalId())) {
            throw new ResourceNotFoundException("Patient", patientId);
        }

        if (principal.isPatient()) {
            if (patient.getUserId() == null || !patient.getUserId().equals(principal.getId())) {
                throw new ResourceNotFoundException("Patient", patientId);
            }
        } else if (principal.isDoctor()) {
            if (patient.getDoctorId() == null || !patient.getDoctorId().equals(principal.getId())) {
                throw new AccessDeniedException("Not assigned to this patient");
            }
        } else if (principal.isHospitalAdmin()) {
            // Already validated hospital ID above
        } else if (principal.isReceptionist()) {
            // Receptionists typically schedule appointments, but might need to view patient.
        } else {
            throw new AccessDeniedException("Unauthorized");
        }

        return patient;
    }

    private PatientSymptomResponse buildSymptomResponse(PatientSymptom ps, SymptomMaster symptom) {
        return PatientSymptomResponse.builder()
                .id(ps.getId())
                .patientId(ps.getPatientId())
                .symptomId(symptom.getId())
                .symptomName(symptom.getName())
                .category(symptom.getCategory().name())
                .severity(ps.getSeverity())
                .notes(ps.getNotes())
                .recordedAt(ps.getRecordedAt())
                .build();
    }

    private PatientVitalsResponse buildVitalsResponse(PatientVitals pv) {
        return PatientVitalsResponse.builder()
                .id(pv.getId())
                .patientId(pv.getPatientId())
                .bloodPressureSystolic(pv.getBloodPressureSystolic())
                .bloodPressureDiastolic(pv.getBloodPressureDiastolic())
                .heartRate(pv.getHeartRate())
                .oxygenSaturation(pv.getOxygenSaturation())
                .temperature(pv.getTemperature())
                .bloodSugar(pv.getBloodSugar())
                .weight(pv.getWeight())
                .height(pv.getHeight())
                .bmi(pv.getBmi())
                .recordedAt(pv.getRecordedAt())
                .build();
    }

    private HealthJournalResponse buildJournalResponse(HealthJournal hj) {
        return HealthJournalResponse.builder()
                .id(hj.getId())
                .patientId(hj.getPatientId())
                .title(hj.getTitle())
                .description(hj.getDescription())
                .mood(hj.getMood())
                .createdAt(hj.getCreatedAt())
                .build();
    }
}
