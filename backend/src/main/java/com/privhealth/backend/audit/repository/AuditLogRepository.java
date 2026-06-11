package com.privhealth.backend.audit.repository;

import com.privhealth.backend.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.user WHERE (:userId IS NULL OR a.userId = :userId)")
    Page<AuditLog> findAllWithUser(Long userId, Pageable pageable);

    Page<AuditLog> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.user WHERE a.hospitalId = :hospitalId AND (:userId IS NULL OR a.userId = :userId)")
    Page<AuditLog> findAllWithUserByHospitalId(@Param("hospitalId") Long hospitalId, @Param("userId") Long userId, Pageable pageable);
}
