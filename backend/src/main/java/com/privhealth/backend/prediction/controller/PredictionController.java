package com.privhealth.backend.prediction.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.common.response.PageMeta;
import com.privhealth.backend.prediction.dto.PredictionRequest;
import com.privhealth.backend.prediction.dto.PredictionResponse;
import com.privhealth.backend.prediction.service.PredictionService;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PredictionResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PredictionRequest request,
            HttpServletRequest httpRequest) {
        PredictionResponse prediction = predictionService.create(principal, request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Prediction created successfully", prediction));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PredictionResponse> result = predictionService.list(principal,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok("Predictions retrieved", result.getContent(),
                PageMeta.from(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PredictionResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        PredictionResponse prediction = predictionService.getById(principal, id);
        return ResponseEntity.ok(ApiResponse.ok(prediction));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getByPatient(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long patientId) {
        List<PredictionResponse> predictions = predictionService.getByPatientId(principal, patientId);
        return ResponseEntity.ok(ApiResponse.ok("Predictions retrieved", predictions));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        predictionService.delete(principal, id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Prediction deleted successfully", null));
    }
}
