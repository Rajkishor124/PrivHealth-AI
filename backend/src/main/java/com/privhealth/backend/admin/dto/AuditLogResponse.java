package com.privhealth.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private String ipAddress;
    private String createdAt;
}
