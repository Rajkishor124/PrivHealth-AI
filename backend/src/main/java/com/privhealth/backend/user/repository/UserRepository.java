package com.privhealth.backend.user.repository;

import com.privhealth.backend.user.entity.StaffStatus;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByRole(Role role, Pageable pageable);

    List<User> findByRoleAndStaffStatusOrderByCreatedAtAsc(Role role, StaffStatus status);

    long countByRole(Role role);

    long countByRoleAndStaffStatus(Role role, StaffStatus status);

    long countByStaffStatus(StaffStatus status);

    // Multi-tenant methods
    Page<User> findByHospitalId(Long hospitalId, Pageable pageable);

    Page<User> findByRoleAndHospitalId(Role role, Long hospitalId, Pageable pageable);

    List<User> findByRoleAndStaffStatusAndHospitalIdOrderByCreatedAtAsc(Role role, StaffStatus status, Long hospitalId);

    long countByHospitalId(Long hospitalId);

    long countByRoleAndHospitalId(Role role, Long hospitalId);

    long countByRoleAndStaffStatusAndHospitalId(Role role, StaffStatus status, Long hospitalId);

    long countByStaffStatusAndHospitalId(StaffStatus status, Long hospitalId);
}
