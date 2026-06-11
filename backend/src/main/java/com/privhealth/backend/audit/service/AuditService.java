package com.privhealth.backend.audit.service;

import com.privhealth.backend.audit.entity.AuditLog;
import com.privhealth.backend.audit.repository.AuditLogRepository;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public void log(String action, String entityType, Long entityId,
                    String details, HttpServletRequest request) {
        Long userId = getCurrentUserId();
        Long hospitalId = getCurrentUserHospitalId();
        String ipAddress = extractIpAddress(request);

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .hospitalId(hospitalId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
        log.debug("Audit: action={}, entityType={}, entityId={}, userId={}, hospitalId={}",
                action, entityType, entityId, userId, hospitalId);
    }

    /**
     * For cases where no HttpServletRequest is available (e.g., failed logins
     * where we still want to log with the request from the controller).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logWithNewTransaction(String action, String entityType, Long entityId,
                                      String details, HttpServletRequest request) {
        Long userId = getCurrentUserId();
        Long hospitalId = getCurrentUserHospitalId();
        String ipAddress = extractIpAddress(request);

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .hospitalId(hospitalId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * For failed login attempts where we know the user from the email lookup
     * but they are not in SecurityContext.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logFailedLogin(Long userId, String details, HttpServletRequest request) {
        String ipAddress = extractIpAddress(request);

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .action("LOGIN_FAILED")
                .entityType("USER")
                .entityId(userId)
                .details(details)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getId();
        }
        return null;
    }

    private Long getCurrentUserHospitalId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getHospitalId();
        }
        return null;
    }

    private String extractIpAddress(HttpServletRequest request) {
        if (request == null) return null;
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
