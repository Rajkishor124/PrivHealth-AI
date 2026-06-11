package com.privhealth.backend.user.mapper;

import com.privhealth.backend.user.dto.UserResponse;
import com.privhealth.backend.user.entity.User;

public final class UserMapper {

    private UserMapper() {}

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .staffStatus(user.getStaffStatus())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
