package com.privhealth.backend.prediction.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.DoctorNotApprovedException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.explanation.dto.FeatureContributionDto;
import com.privhealth.backend.explanation.entity.Explanation;
import com.privhealth.backend.explanation.repository.ExplanationRepository;
import com.privhealth.backend.ml.client.MlClient;
import com.privhealth.backend.ml.dto.MlPredictRequest;
import com.privhealth.backend.ml.dto.MlPredictResponse;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.prediction.dto.PredictionRequest;
import com.privhealth.backend.prediction.dto.PredictionResponse;
import com.privhealth.backend.prediction.entity.Prediction;
import com.privhealth.backend.prediction.entity.RiskCategory;
import com.privhealth.backend.prediction.repository.PredictionRepository;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final ExplanationRepository explanationRepository;
    private final PatientRepository patientRepository;
    private final MlClient mlClient;
    private final AuditService auditService;

    @Transactional
    public PredictionResponse create(UserPrincipal principal, PredictionRequest request,
                                      HttpServletRequest httpRequest) {
        requireApprovedDoctor(principal);

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", request.getPatientId()));

        if (!principal.isSuperAdmin() && !patient.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Patient", request.getPatientId());
        }

        // Call ML service BEFORE persisting anything
        MlPredictRequest mlRequest = MlPredictRequest.builder()
                .age(request.getAge())
                .bloodPressure(request.getBloodPressure())
                .cholesterol(request.getCholesterol())
                .diabetes(request.getDiabetes() ? 1 : 0)
                .bmi(request.getBmi())
                .heartRate(request.getHeartRate())
                .build();

        MlPredictResponse mlResponse = mlClient.predict(mlRequest);

        // Validate/recompute risk category from score
        RiskCategory category = RiskCategory.fromScore(mlResponse.getRiskScore());
        try {
            RiskCategory mlCategory = RiskCategory.valueOf(mlResponse.getRiskCategory());
            if (mlCategory != category) {
                log.warn("ML category {} disagrees with computed category {} for score {}. Using computed.",
                        mlCategory, category, mlResponse.getRiskScore());
            }
        } catch (IllegalArgumentException e) {
            log.warn("ML returned unknown category: {}. Using computed: {}",
                    mlResponse.getRiskCategory(), category);
        }

        // Persist prediction
        Prediction prediction = Prediction.builder()
                .patientId(request.getPatientId())
                .hospitalId(principal.getHospitalId())
                .riskScore(mlResponse.getRiskScore())
                .riskCategory(category)
                .inputAge(request.getAge())
                .inputBloodPressure(request.getBloodPressure())
                .inputCholesterol(request.getCholesterol())
                .inputDiabetes(request.getDiabetes())
                .inputBmi(request.getBmi())
                .inputHeartRate(request.getHeartRate())
                .build();

        prediction = predictionRepository.save(prediction);

        // Persist explanations
        List<FeatureContributionDto> contributionDtos = new java.util.ArrayList<>();
        if (mlResponse.getContributions() != null) {
            for (MlPredictResponse.MlContribution c : mlResponse.getContributions()) {
                Explanation explanation = Explanation.builder()
                        .predictionId(prediction.getId())
                        .featureName(toCamelCase(c.getFeature()))
                        .contribution(c.getValue())
                        .baseValue(mlResponse.getBaseValue())
                        .build();
                explanationRepository.save(explanation);

                contributionDtos.add(FeatureContributionDto.builder()
                        .featureName(toCamelCase(c.getFeature()))
                        .contribution(c.getValue())
                        .build());
            }
        }

        // Audit
        auditService.log("PREDICTION_CREATED", "PREDICTION", prediction.getId(),
                "riskCategory: " + category.name(), httpRequest);

        return toResponse(prediction, patient.getFirstName() + " " + patient.getLastName(), contributionDtos);
    }

    @Transactional(readOnly = true)
    public Page<PredictionResponse> list(UserPrincipal principal, Pageable pageable) {
        Page<Prediction> predictions;

        if (principal.isSuperAdmin()) {
            predictions = predictionRepository.findAllWithPatient(pageable);
        } else if (principal.getHospitalId() != null) {
            if (principal.isDoctor()) requireApprovedDoctor(principal);
            predictions = predictionRepository.findByHospitalId(principal.getHospitalId(), pageable);
        } else {
            throw new ResourceNotFoundException("Predictions", "unauthorized");
        }

        return predictions.map(p -> toResponse(p, 
                p.getPatient() != null ? p.getPatient().getFirstName() + " " + p.getPatient().getLastName() : null, (List<FeatureContributionDto>) null));
    }

    @Transactional(readOnly = true)
    public PredictionResponse getById(UserPrincipal principal, Long id) {
        Prediction prediction = predictionRepository.findByIdWithPatient(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction", id));

        authorizeAccess(principal, prediction);

        List<FeatureContributionDto> contributions = explanationRepository
                .findByPredictionIdOrderByAbsContribution(id)
                .stream()
                .map(e -> FeatureContributionDto.builder()
                        .featureName(e.getFeatureName())
                        .contribution(e.getContribution())
                        .build())
                .collect(Collectors.toList());

        return toResponse(prediction,
                prediction.getPatient() != null ? prediction.getPatient().getFirstName() + " " + prediction.getPatient().getLastName() : null,
                contributions);
    }

    @Transactional(readOnly = true)
    public List<PredictionResponse> getByPatientId(UserPrincipal principal, Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        authorizePatientAccess(principal, patient);

        return predictionRepository.findByPatientIdWithPatient(patientId).stream()
                .map(p -> toResponse(p, patient.getFirstName() + " " + patient.getLastName(), (List<FeatureContributionDto>) null))
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(UserPrincipal principal, Long id, HttpServletRequest httpRequest) {
        Prediction prediction = predictionRepository.findByIdWithPatient(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction", id));

        if (!principal.isSuperAdmin()) {
            if (prediction.getHospitalId() == null || !prediction.getHospitalId().equals(principal.getHospitalId())) {
                throw new ResourceNotFoundException("Prediction", id);
            }
            if (principal.isDoctor()) requireApprovedDoctor(principal);
        }

        predictionRepository.delete(prediction); // Cascades to explanations

        auditService.log("PREDICTION_DELETED", "PREDICTION", id,
                null, httpRequest);
    }

    private void authorizeAccess(UserPrincipal principal, Prediction prediction) {
        if (principal.isSuperAdmin()) return;

        if (principal.getHospitalId() == null || !principal.getHospitalId().equals(prediction.getHospitalId())) {
            throw new ResourceNotFoundException("Prediction", prediction.getId());
        }

        Patient patient = prediction.getPatient();

        if (principal.isPatient()) {
            if (patient == null || patient.getUserId() == null || !patient.getUserId().equals(principal.getId())) {
                throw new ResourceNotFoundException("Prediction", prediction.getId());
            }
        } else if (principal.isDoctor()) {
            requireApprovedDoctor(principal);
        }
    }

    private void authorizePatientAccess(UserPrincipal principal, Patient patient) {
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

        if (principal.isDoctor()) {
            requireApprovedDoctor(principal);
        }
    }

    private void requireApprovedDoctor(UserPrincipal principal) {
        if (principal.isDoctor() && !principal.isApprovedDoctor()) {
            throw new DoctorNotApprovedException();
        }
    }

    private PredictionResponse toResponse(Prediction p, String patientName,
                                           List<FeatureContributionDto> explanations) {
        return PredictionResponse.builder()
                .id(p.getId())
                .patientId(p.getPatientId())
                .patientName(patientName)
                .riskScore(p.getRiskScore())
                .riskCategory(p.getRiskCategory())
                .input(PredictionResponse.PredictionInputDto.builder()
                        .age(p.getInputAge())
                        .bloodPressure(p.getInputBloodPressure())
                        .cholesterol(p.getInputCholesterol())
                        .diabetes(p.isInputDiabetes())
                        .bmi(p.getInputBmi())
                        .heartRate(p.getInputHeartRate())
                        .build())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .explanations(explanations)
                .build();
    }

    private String toCamelCase(String snakeCase) {
        if (snakeCase == null || !snakeCase.contains("_")) return snakeCase;
        StringBuilder result = new StringBuilder();
        boolean capitalizeNext = false;
        for (char c : snakeCase.toCharArray()) {
            if (c == '_') {
                capitalizeNext = true;
            } else {
                result.append(capitalizeNext ? Character.toUpperCase(c) : c);
                capitalizeNext = false;
            }
        }
        return result.toString();
    }
}
