package com.privhealth.backend.auth.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.auth.dto.*;
import com.privhealth.backend.auth.entity.PasswordResetToken;
import com.privhealth.backend.auth.repository.PasswordResetTokenRepository;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.common.exception.EmailExistsException;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.security.jwt.JwtProperties;
import com.privhealth.backend.security.jwt.JwtTokenProvider;
import com.privhealth.backend.user.dto.UserResponse;
import com.privhealth.backend.user.entity.StaffStatus;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.mapper.UserMapper;
import com.privhealth.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final com.privhealth.backend.hospital.repository.HospitalRepository hospitalRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final JwtProperties jwtProperties;
    private final AuditService auditService;

    @Transactional
    public UserResponse register(RegisterRequest request, HttpServletRequest httpRequest) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailExistsException(request.getEmail());
        }

        Role role = Role.valueOf(request.getRole());

        com.privhealth.backend.hospital.entity.Hospital hospital = null;
        if (role != Role.SUPER_ADMIN) {
            hospital = hospitalRepository.findByHospitalCode(request.getHospitalCode())
                    .orElseThrow(() -> new BadRequestException("Invalid hospital code"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .staffStatus(role == Role.DOCTOR ? StaffStatus.PENDING : null)
                .hospital(hospital)
                .hospitalId(hospital != null ? hospital.getId() : null)
                .build();

        user = userRepository.save(user);

        auditService.log("USER_REGISTERED", "USER", user.getId(),
                "Role: " + role.name(), httpRequest);

        return UserMapper.toResponse(user);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            String token = tokenProvider.generateToken(principal);

            // Audit success — use REQUIRES_NEW so it persists even if something goes wrong after
            auditService.logWithNewTransaction("LOGIN_SUCCESS", "USER",
                    principal.getId(), "Email: " + request.getEmail(), httpRequest);

            return LoginResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtProperties.getExpirationSeconds())
                    .user(UserMapper.toResponse(
                            userRepository.findById(principal.getId()).orElseThrow()))
                    .build();

        } catch (BadCredentialsException ex) {
            // Audit failed login
            userRepository.findByEmail(request.getEmail()).ifPresent(user ->
                    auditService.logFailedLogin(user.getId(),
                            "Email: " + request.getEmail(), httpRequest));
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return UserMapper.toResponse(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        // Always return success to prevent user enumeration
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            // Generate 32-byte random token
            SecureRandom random = new SecureRandom();
            byte[] tokenBytes = new byte[32];
            random.nextBytes(tokenBytes);
            String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

            // Store SHA-256 hash
            String tokenHash = sha256(rawToken);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .userId(user.getId())
                    .tokenHash(tokenHash)
                    .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
                    .used(false)
                    .build();

            resetTokenRepository.save(resetToken);

            // Log the reset link (email sending is stubbed per DECISIONS.md D4)
            log.info("=== PASSWORD RESET LINK ===");
            log.info("User: {} ({})", user.getEmail(), user.getId());
            log.info("Reset URL: http://localhost:5173/reset-password?token={}", rawToken);
            log.info("Expires: {} (30 minutes)", resetToken.getExpiresAt());
            log.info("===========================");

            auditService.log("PASSWORD_RESET_REQUESTED", "USER", user.getId(),
                    null, httpRequest);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request, HttpServletRequest httpRequest) {
        String tokenHash = sha256(request.getToken());

        PasswordResetToken resetToken = resetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("Reset token has expired");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        auditService.log("PASSWORD_RESET_COMPLETED", "USER", user.getId(),
                null, httpRequest);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
