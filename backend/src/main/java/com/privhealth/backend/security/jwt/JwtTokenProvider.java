package com.privhealth.backend.security.jwt;

import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.user.entity.StaffStatus;
import com.privhealth.backend.user.entity.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    private SecretKey key;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtProperties.getSecret());
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getExpirationSeconds() * 1000L);

        return Jwts.builder()
                .subject(String.valueOf(principal.getId()))
                .claim("email", principal.getEmail())
                .claim("name", principal.getName())
                .claim("role", principal.getRole().name())
                .claim("staffStatus", principal.getStaffStatus() != null
                        ? principal.getStaffStatus().name() : null)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaimsJws(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getEmailFromToken(String token) {
        return parseClaimsJws(token).get("email", String.class);
    }

    public Role getRoleFromToken(String token) {
        return Role.valueOf(parseClaimsJws(token).get("role", String.class));
    }

    public StaffStatus getStaffStatusFromToken(String token) {
        String status = parseClaimsJws(token).get("staffStatus", String.class);
        return status != null ? StaffStatus.valueOf(status) : null;
    }

    public boolean validateToken(String token) {
        try {
            parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT token expired: {}", ex.getMessage());
            throw ex;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            throw new JwtException("Invalid token", ex);
        }
    }

    private Claims parseClaimsJws(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
