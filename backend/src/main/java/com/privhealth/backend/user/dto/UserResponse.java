package com.privhealth.backend.user.dto;

import com.privhealth.backend.user.entity.StaffStatus;
import com.privhealth.backend.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private StaffStatus staffStatus;
    private String createdAt;
}
