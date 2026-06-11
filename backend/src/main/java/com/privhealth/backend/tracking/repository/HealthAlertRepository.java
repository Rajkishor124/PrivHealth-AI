package com.privhealth.backend.tracking.repository;

import com.privhealth.backend.tracking.entity.AlertSeverity;
import com.privhealth.backend.tracking.entity.HealthAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthAlertRepository extends JpaRepository<HealthAlert, Long> {
    Page<HealthAlert> findByPatientId(Long patientId, Pageable pageable);
    
    Page<HealthAlert> findByHospitalId(Long hospitalId, Pageable pageable);
    
    long countByHospitalIdAndSeverity(Long hospitalId, AlertSeverity severity);
    
    List<HealthAlert> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
