package com.privhealth.backend.ml.client;

import com.privhealth.backend.common.exception.MlServiceException;
import com.privhealth.backend.config.app.MlProperties;
import com.privhealth.backend.ml.dto.MlPredictRequest;
import com.privhealth.backend.ml.dto.MlPredictResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Slf4j
@Component
public class MlClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public MlClient(MlProperties mlProperties, RestTemplateBuilder builder) {
        this.baseUrl = mlProperties.getBaseUrl();
        this.restTemplate = builder
                .connectTimeout(Duration.ofMillis(mlProperties.getTimeoutMs()))
                .readTimeout(Duration.ofMillis(mlProperties.getTimeoutMs()))
                .build();
    }

    @CircuitBreaker(name = "mlService", fallbackMethod = "predictFallback")
    @Retry(name = "mlService")
    public MlPredictResponse predict(MlPredictRequest request) {
        String url = baseUrl + "/predict";
        log.debug("Calling ML service at {}", url);

        try {
            ResponseEntity<MlPredictResponse> response = restTemplate.postForEntity(
                    url, request, MlPredictResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.debug("ML service returned prediction successfully");
                return response.getBody();
            }

            throw new MlServiceException("ML service returned unexpected status: "
                    + response.getStatusCode());
        } catch (ResourceAccessException ex) {
            log.warn("ML service connection failed: {}", ex.getMessage());
            throw new MlServiceException("ML prediction service is unavailable", ex);
        } catch (MlServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("ML service error: {}", ex.getMessage());
            throw new MlServiceException("ML prediction service error", ex);
        }
    }

    /**
     * Fallback method invoked when the circuit breaker is open.
     */
    private MlPredictResponse predictFallback(MlPredictRequest request, Throwable t) {
        log.error("ML service circuit breaker triggered — fallback invoked. Cause: {}", t.getMessage());
        throw new MlServiceException(
                "ML prediction service is currently unavailable. Please try again later.", t);
    }
}
