package com.privhealth.backend.explanation.service;

import com.privhealth.backend.common.exception.DoctorNotApprovedException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.explanation.dto.ExplanationResponse;
import com.privhealth.backend.explanation.dto.FeatureContributionDto;
import com.privhealth.backend.explanation.entity.Explanation;
import com.privhealth.backend.explanation.repository.ExplanationRepository;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.prediction.entity.Prediction;
import com.privhealth.backend.prediction.repository.PredictionRepository;
import com.privhealth.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExplanationService {

    private final ExplanationRepository explanationRepository;
    private final PredictionRepository predictionRepository;

    @Transactional(readOnly = true)
    public ExplanationResponse getByPredictionId(UserPrincipal principal, Long predictionId) {
        Prediction prediction = predictionRepository.findByIdWithPatient(predictionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction", predictionId));

        authorizeAccess(principal, prediction);

        List<Explanation> explanations = explanationRepository
                .findByPredictionIdOrderByAbsContribution(predictionId);

        double baseValue = explanations.isEmpty() ? 0.0 : explanations.get(0).getBaseValue();

        List<FeatureContributionDto> contributions = explanations.stream()
                .map(e -> FeatureContributionDto.builder()
                        .featureName(e.getFeatureName())
                        .contribution(e.getContribution())
                        .build())
                .collect(Collectors.toList());

        return ExplanationResponse.builder()
                .predictionId(predictionId)
                .riskScore(prediction.getRiskScore())
                .riskCategory(prediction.getRiskCategory())
                .baseValue(baseValue)
                .contributions(contributions)
                .build();
    }

    private void authorizeAccess(UserPrincipal principal, Prediction prediction) {
        if (principal.isSuperAdmin() || principal.isHospitalAdmin()) return;

        Patient patient = prediction.getPatient();
        if (patient == null) {
            throw new ResourceNotFoundException("Prediction", prediction.getId());
        }

        if (principal.isDoctor()) {
            if (!principal.isApprovedDoctor()) throw new DoctorNotApprovedException();
            if (patient.getDoctorId() == null || !patient.getDoctorId().equals(principal.getId())) {
                throw new ResourceNotFoundException("Prediction", prediction.getId());
            }
            return;
        }

        if (principal.isPatient()) {
            if (patient.getUserId() == null || !patient.getUserId().equals(principal.getId())) {
                throw new ResourceNotFoundException("Prediction", prediction.getId());
            }
            return;
        }

        throw new ResourceNotFoundException("Prediction", prediction.getId());
    }
}
