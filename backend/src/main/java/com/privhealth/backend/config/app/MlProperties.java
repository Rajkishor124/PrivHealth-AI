package com.privhealth.backend.config.app;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.ml")
@Getter
@Setter
public class MlProperties {
    private String baseUrl = "http://localhost:8000";
    private int timeoutMs = 5000;
}
