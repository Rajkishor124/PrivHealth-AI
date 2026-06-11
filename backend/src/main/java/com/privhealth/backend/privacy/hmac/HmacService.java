package com.privhealth.backend.privacy.hmac;

import com.privhealth.backend.common.exception.DataIntegrityException;
import com.privhealth.backend.config.app.CryptoProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * HMAC-SHA256 service for verifying medical history integrity at rest.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HmacService {

    private static final String ALGORITHM = "HmacSHA256";

    private final CryptoProperties cryptoProperties;
    private SecretKeySpec hmacKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Base64.getDecoder().decode(cryptoProperties.getHmacKey());
        this.hmacKey = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    public String sign(String plaintext) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(hmacKey);
            byte[] hash = mac.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC signing failed", e);
        }
    }

    public void verify(String plaintext, String expectedHmac) {
        String computedHmac = sign(plaintext);
        // Constant-time comparison to prevent timing attacks
        if (!MessageDigest.isEqual(
                computedHmac.getBytes(StandardCharsets.UTF_8),
                expectedHmac.getBytes(StandardCharsets.UTF_8))) {
            log.warn("HMAC mismatch detected — data may have been tampered with");
            throw new DataIntegrityException("Data integrity verification failed");
        }
    }
}
