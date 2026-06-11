package com.privhealth.backend.prediction.service;

import com.privhealth.backend.ml.client.MlClient;
import com.privhealth.backend.ml.dto.MlPredictRequest;
import com.privhealth.backend.ml.dto.MlPredictResponse;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.prediction.dto.PatientFeatureProfile;
import com.privhealth.backend.prediction.entity.*;
import com.privhealth.backend.prediction.repository.RiskAlertRepository;
import com.privhealth.backend.prediction.repository.RiskAssessmentRepository;
import com.privhealth.backend.audit.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskAssessmentService {

    private final PatientFeatureProfileService profileService;
    private final MlClient mlClient;
    private final PatientRepository patientRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final AuditService auditService;
    private final com.privhealth.backend.subscription.service.SubscriptionService subscriptionService;

    @Transactional
    public List<RiskAssessment> generateAssessments(Long patientId, HttpServletRequest request) {
        log.info("Generating multi-disease risk assessments for patient ID: {}", patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Enforce SaaS Prediction Limit
        subscriptionService.validateAndIncrementPredictionCount(patient.getHospitalId());

        PatientFeatureProfile profile = profileService.buildProfile(patientId);

        MlPredictRequest mlRequest = MlPredictRequest.builder()
                .age(profile.getAge())
                .bloodPressure(profile.getSystolicBloodPressure())
                .cholesterol(profile.getCholesterol())
                .diabetes(profile.getHasDiabetes() ? 1 : 0)
                .bmi(profile.getBmi())
                .heartRate(profile.getHeartRate())
                .build();

        MlPredictResponse mlResponse = mlClient.predict(mlRequest);
        double baseScore = mlResponse.getRiskScore();

        List<RiskAssessment> assessments = new ArrayList<>();

        assessments.add(buildDiabetesAssessment(patient, profile, baseScore, mlResponse));
        assessments.add(buildHeartDiseaseAssessment(patient, profile, baseScore, mlResponse));
        assessments.add(buildHypertensionAssessment(patient, profile, baseScore, mlResponse));

        assessments = riskAssessmentRepository.saveAll(assessments);

        // Audit Logging
        for (RiskAssessment assessment : assessments) {
            auditService.log("PREDICTION_GENERATED", "RISK_ASSESSMENT", assessment.getId(),
                    "Generated AI risk assessment for " + assessment.getTargetDisease().name() + " with score: " + assessment.getRiskScore(), request);
        }

        // Early warning system check
        for (RiskAssessment assessment : assessments) {
            if (assessment.getRiskCategory() == RiskCategory.CRITICAL) {
                createCriticalAlert(assessment, patient, request);
            }
        }

        return assessments;
    }

    private RiskAssessment buildDiabetesAssessment(Patient patient, PatientFeatureProfile profile, double baseScore, MlPredictResponse mlResponse) {
        double modifier = (profile.getBloodSugar() > 140) ? 0.2 : 0.0;
        if (profile.getHasDiabetes()) modifier += 0.3;
        double finalScore = Math.min(1.0, baseScore + modifier);

        RiskCategory category = RiskCategory.fromScore(finalScore);
        String recommendation = category == RiskCategory.CRITICAL || category == RiskCategory.HIGH 
                ? "Schedule HbA1c test immediately." : "Maintain healthy diet and regular check-ups.";

        return buildAssessmentEntity(patient, TargetDisease.DIABETES, finalScore, category, recommendation, mlResponse);
    }

    private RiskAssessment buildHeartDiseaseAssessment(Patient patient, PatientFeatureProfile profile, double baseScore, MlPredictResponse mlResponse) {
        double modifier = 0.0;
        if (profile.getHeartRate() > 100) modifier += 0.15;
        if (profile.getCholesterol() > 240) modifier += 0.15;
        double finalScore = Math.min(1.0, baseScore + modifier);

        RiskCategory category = RiskCategory.fromScore(finalScore);
        String recommendation = category == RiskCategory.CRITICAL || category == RiskCategory.HIGH 
                ? "Refer to cardiology specialist." : "Engage in regular cardiovascular exercise.";

        return buildAssessmentEntity(patient, TargetDisease.HEART_DISEASE, finalScore, category, recommendation, mlResponse);
    }

    private RiskAssessment buildHypertensionAssessment(Patient patient, PatientFeatureProfile profile, double baseScore, MlPredictResponse mlResponse) {
        double modifier = 0.0;
        if (profile.getSystolicBloodPressure() > 140) modifier += 0.25;
        if (profile.getDiastolicBloodPressure() > 90) modifier += 0.1;
        double finalScore = Math.min(1.0, baseScore + modifier);

        RiskCategory category = RiskCategory.fromScore(finalScore);
        String recommendation = category == RiskCategory.CRITICAL || category == RiskCategory.HIGH 
                ? "Monitor daily for 14 days and reduce sodium intake." : "Check blood pressure annually.";

        return buildAssessmentEntity(patient, TargetDisease.HYPERTENSION, finalScore, category, recommendation, mlResponse);
    }

    private RiskAssessment buildAssessmentEntity(Patient patient, TargetDisease disease, double score, RiskCategory category, String recommendation, MlPredictResponse mlResponse) {
        RiskAssessment assessment = RiskAssessment.builder()
                .patient(patient)
                .hospital(patient.getHospital())
                .targetDisease(disease)
                .riskCategory(category)
                .riskScore(score)
                .confidenceScore(0.85) // Placeholder or derived from ML Model Accuracy
                .modelVersion("v1.0.0") // Ideally fetched from ModelRegistry
                .predictionSummary("AI generated assessment based on recent vitals and profile.")
                .recommendations(recommendation)
                .build();

        if (mlResponse.getContributions() != null) {
            mlResponse.getContributions().forEach(c -> {
                assessment.getExplanations().add(RiskAssessmentExplanation.builder()
                        .riskAssessment(assessment)
                        .featureName(c.getFeature())
                        .contributionValue(c.getValue())
                        .build());
            });
        }
        return assessment;
    }

    private void createCriticalAlert(RiskAssessment assessment, Patient patient, HttpServletRequest request) {
        RiskAlert alert = RiskAlert.builder()
                .patient(patient)
                .hospital(patient.getHospital())
                .alertType(assessment.getTargetDisease().name() + "_CRITICAL")
                .severity(RiskAlertSeverity.CRITICAL)
                .message("Patient is at CRITICAL risk for " + assessment.getTargetDisease().name() + ". Immediate action required. Score: " + String.format("%.2f", assessment.getRiskScore()))
                .build();
        riskAlertRepository.save(alert);
        
        auditService.log("ALERT_GENERATED", "RISK_ALERT", alert.getId(),
                "Generated " + alert.getAlertType() + " alert.", request);
                
        log.warn("Generated CRITICAL RiskAlert for patient ID: {}", patient.getId());
    }
}
