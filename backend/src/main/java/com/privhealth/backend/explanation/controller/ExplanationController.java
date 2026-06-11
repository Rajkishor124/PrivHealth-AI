package com.privhealth.backend.explanation.controller;

import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.explanation.dto.ExplanationResponse;
import com.privhealth.backend.explanation.service.ExplanationService;
import com.privhealth.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/explanations")
@RequiredArgsConstructor
public class ExplanationController {

    private final ExplanationService explanationService;

    @GetMapping("/{predictionId}")
    public ResponseEntity<ApiResponse<ExplanationResponse>> getByPredictionId(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long predictionId) {
        ExplanationResponse explanation = explanationService.getByPredictionId(principal, predictionId);
        return ResponseEntity.ok(ApiResponse.ok(explanation));
    }
}
