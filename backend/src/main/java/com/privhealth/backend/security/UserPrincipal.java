package com.privhealth.backend.security;

import com.privhealth.backend.user.entity.StaffStatus;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String name;
    private final String email;
    private final String password;
    private final Role role;
    private final StaffStatus staffStatus;
    private final Long hospitalId;

    public static UserPrincipal from(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getRole(),
                user.getStaffStatus(),
                user.getHospitalId()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public boolean isSuperAdmin() {
        return role == Role.SUPER_ADMIN;
    }

    public boolean isHospitalAdmin() {
        return role == Role.HOSPITAL_ADMIN;
    }

    public boolean isDoctor() {
        return role == Role.DOCTOR;
    }

    public boolean isPatient() {
        return role == Role.PATIENT;
    }

    public boolean isReceptionist() {
        return role == Role.RECEPTIONIST;
    }

    public boolean isApprovedDoctor() {
        return role == Role.DOCTOR && staffStatus == StaffStatus.APPROVED;
    }
}
