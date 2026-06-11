package com.privhealth.backend.privacy.encryption;

import com.privhealth.backend.common.exception.DataIntegrityException;
import com.privhealth.backend.config.app.CryptoProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM encryption service for patient medical history.
 * Output format: base64(iv || ciphertext || tag)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12; // 96 bits
    private static final int TAG_LENGTH = 128; // bits

    private final CryptoProperties cryptoProperties;
    private SecretKeySpec secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void init() {
        byte[] keyBytes = Base64.getDecoder().decode(cryptoProperties.getAesKey());
        if (keyBytes.length != 32) {
            throw new IllegalStateException("AES key must be 256 bits (32 bytes), got " + keyBytes.length);
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // Combine: iv || ciphertext (includes GCM tag)
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);

            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String encryptedBase64) {
        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedBase64);

            ByteBuffer buffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, java.nio.charset.StandardCharsets.UTF_8);
        } catch (AEADBadTagException e) {
            log.error("AES-GCM authentication tag mismatch — data may have been tampered with");
            throw new DataIntegrityException("Encrypted data integrity check failed");
        } catch (Exception e) {
            throw new DataIntegrityException("Decryption failed: " + e.getMessage());
        }
    }
}
