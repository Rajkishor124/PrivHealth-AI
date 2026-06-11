package com.privhealth.backend.config.app;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.crypto")
@Getter
@Setter
public class CryptoProperties {
    private String aesKey;
    private String hmacKey;
}
