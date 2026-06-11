package com.privhealth.backend.prediction.service;

import com.privhealth.backend.emr.repository.DiagnosisRepository;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.prediction.dto.PatientFeatureProfile;
import com.privhealth.backend.tracking.entity.PatientVitals;
import com.privhealth.backend.tracking.repository.PatientSymptomRepository;
import com.privhealth.backend.tracking.repository.PatientVitalsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientFeatureProfileService {

    private final PatientRepository patientRepository;
    private final PatientVitalsRepository patientVitalsRepository;
    private final PatientSymptomRepository patientSymptomRepository;
    private final DiagnosisRepository diagnosisRepository;

    @Transactional(readOnly = true)
    public PatientFeatureProfile buildProfile(Long patientId) {
        log.info("Building feature profile for patient ID: {}", patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));

        int age = Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();

        PatientVitals latestVitals = patientVitalsRepository.findFirstByPatientIdOrderByRecordedAtDesc(patientId)
                .orElse(null);

        // Calculate counts
        int symptomCount = (int) patientSymptomRepository.findByPatientId(patientId, PageRequest.of(0, 1000)).getTotalElements();
        int diagnosisCount = (int) diagnosisRepository.findByPatientId(patientId, PageRequest.of(0, 1000)).getTotalElements();

        // Check if there is an existing diabetes diagnosis
        boolean hasDiabetes = diagnosisRepository.findByPatientId(patientId, PageRequest.of(0, 1000))
                .stream()
                .anyMatch(d -> d.getDiagnosisName().toLowerCase().contains("diabetes"));

        return PatientFeatureProfile.builder()
                .patientId(patientId)
                .age(age)
                .systolicBloodPressure(latestVitals != null ? latestVitals.getBloodPressureSystolic() : 120) // Default values if none
                .diastolicBloodPressure(latestVitals != null ? latestVitals.getBloodPressureDiastolic() : 80)
                .heartRate(latestVitals != null ? latestVitals.getHeartRate() : 70)
                .bmi(latestVitals != null ? latestVitals.getBmi() : 22.0)
                .bloodSugar(latestVitals != null ? latestVitals.getBloodSugar() : 90)
                .cholesterol(200) // Not currently tracked in vitals by default, mocking safely or default
                .activeSymptomCount(symptomCount)
                .existingDiagnosisCount(diagnosisCount)
                .hasDiabetes(hasDiabetes)
                .build();
    }
}
