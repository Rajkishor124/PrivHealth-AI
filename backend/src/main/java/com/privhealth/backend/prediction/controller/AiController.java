package com.privhealth.backend.prediction.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.prediction.dto.*;
import com.privhealth.backend.prediction.entity.RiskAssessment;
import com.privhealth.backend.prediction.entity.RiskAlert;
import com.privhealth.backend.prediction.repository.RiskAssessmentRepository;
import com.privhealth.backend.prediction.repository.RiskAlertRepository;
import com.privhealth.backend.prediction.repository.ModelRegistryRepository;
import com.privhealth.backend.prediction.service.RiskAssessmentService;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final RiskAssessmentService riskAssessmentService;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final ModelRegistryRepository modelRegistryRepository;

    @PostMapping("/predictions/generate")
    public ResponseEntity<ApiResponse<List<RiskAssessmentResponse>>> generatePredictions(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GeneratePredictionRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        
        // Ensure doctors can only predict for their own hospital. Tenant logic might be inside service or here.
        // For simplicity, passing tenant check to service or assuming it's done via standard authorization
        List<RiskAssessment> assessments = riskAssessmentService.generateAssessments(request.getPatientId(), httpRequest);
        
        List<RiskAssessmentResponse> responses = assessments.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Predictions generated successfully", responses));
    }

    @GetMapping("/predictions")
    public ResponseEntity<ApiResponse<List<RiskAssessmentResponse>>> getPredictions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<RiskAssessment> result = riskAssessmentRepository.findByHospitalId(principal.getHospitalId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "generatedAt")));
        List<RiskAssessmentResponse> responses = result.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Predictions retrieved", responses, PageMeta.from(result)));
    }

    @GetMapping("/predictions/{id}")
    public ResponseEntity<ApiResponse<RiskAssessmentResponse>> getPredictionById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        RiskAssessment assessment = riskAssessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
        
        if (!assessment.getHospital().getId().equals(principal.getHospitalId())) {
            throw new RuntimeException("Access denied");
        }
        return ResponseEntity.ok(ApiResponse.ok(mapToResponse(assessment)));
    }

    @GetMapping("/predictions/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<RiskAssessmentResponse>>> getPatientPredictions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Enforce tenant or self check
        if (principal.getRole().equals("PATIENT") && !principal.getId().equals(patientId)) {
            throw new RuntimeException("Access denied");
        }
        Page<RiskAssessment> result = riskAssessmentRepository.findByPatientId(patientId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "generatedAt")));
        List<RiskAssessmentResponse> responses = result.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Predictions retrieved", responses, PageMeta.from(result)));
    }

    @GetMapping("/risk-alerts")
    public ResponseEntity<ApiResponse<List<RiskAlertResponse>>> getRiskAlerts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<RiskAlert> result = riskAlertRepository.findByHospitalId(principal.getHospitalId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "generatedAt")));
        List<RiskAlertResponse> responses = result.getContent().stream().map(this::mapToAlertResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Alerts retrieved", responses, PageMeta.from(result)));
    }

    @GetMapping("/models")
    public ResponseEntity<ApiResponse<List<ModelRegistryResponse>>> getModels(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ModelRegistryResponse> models = modelRegistryRepository.findAll().stream()
                .map(m -> ModelRegistryResponse.builder()
                        .id(m.getId())
                        .modelName(m.getModelName())
                        .version(m.getVersion())
                        .accuracy(m.getAccuracy())
                        .f1Score(m.getF1Score())
                        .isActive(m.getIsActive())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Models retrieved", models));
    }

    private RiskAssessmentResponse mapToResponse(RiskAssessment assessment) {
        return RiskAssessmentResponse.builder()
                .id(assessment.getId())
                .patientId(assessment.getPatient().getId())
                .targetDisease(assessment.getTargetDisease())
                .riskCategory(assessment.getRiskCategory())
                .riskScore(assessment.getRiskScore())
                .confidenceScore(assessment.getConfidenceScore())
                .modelVersion(assessment.getModelVersion())
                .predictionSummary(assessment.getPredictionSummary())
                .recommendations(assessment.getRecommendations())
                .generatedAt(assessment.getGeneratedAt())
                .explanations(assessment.getExplanations().stream()
                        .map(e -> RiskAssessmentResponse.ExplanationDto.builder()
                                .featureName(e.getFeatureName())
                                .contributionValue(e.getContributionValue())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private RiskAlertResponse mapToAlertResponse(RiskAlert alert) {
        return RiskAlertResponse.builder()
                .id(alert.getId())
                .patientId(alert.getPatient().getId())
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .message(alert.getMessage())
                .generatedAt(alert.getGeneratedAt())
                .build();
    }
}
