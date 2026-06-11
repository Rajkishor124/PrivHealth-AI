package com.privhealth.backend.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.privhealth.backend.common.response.ApiResponse;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.security.jwt.JwtTokenProvider;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractTokenFromRequest(request);
            if (jwt != null) {
                tokenProvider.validateToken(jwt);
                Long userId = tokenProvider.getUserIdFromToken(jwt);

                // Fresh-load user from DB so status changes reflect immediately
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    UserPrincipal principal = UserPrincipal.from(user);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (ExpiredJwtException ex) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token has expired", "TOKEN_EXPIRED");
            return;
        } catch (JwtException ex) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token", "TOKEN_INVALID");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private void sendErrorResponse(HttpServletResponse response, int status,
                                   String message, String code) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> errorResponse = ApiResponse.error(message, code);
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
