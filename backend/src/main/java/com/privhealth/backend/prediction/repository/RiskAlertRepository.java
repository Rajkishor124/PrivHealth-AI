package com.privhealth.backend.prediction.repository;

import com.privhealth.backend.prediction.entity.RiskAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAlertRepository extends JpaRepository<RiskAlert, Long> {
    Page<RiskAlert> findByHospitalId(Long hospitalId, Pageable pageable);
    
    Page<RiskAlert> findByPatientId(Long patientId, Pageable pageable);
    
    List<RiskAlert> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
}
