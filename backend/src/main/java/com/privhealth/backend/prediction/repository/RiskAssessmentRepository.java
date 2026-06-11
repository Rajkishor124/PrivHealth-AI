package com.privhealth.backend.prediction.repository;

import com.privhealth.backend.prediction.entity.RiskAssessment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {
    Page<RiskAssessment> findByHospitalId(Long hospitalId, Pageable pageable);
    
    Page<RiskAssessment> findByPatientId(Long patientId, Pageable pageable);
    
    List<RiskAssessment> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);

    long countByHospitalId(Long hospitalId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT r.patient) FROM RiskAssessment r WHERE r.hospital.id = :hospitalId AND r.riskCategory IN ('HIGH', 'CRITICAL')")
    long countHighRiskPatientsByHospitalId(@org.springframework.data.repository.query.Param("hospitalId") Long hospitalId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT r.patient) FROM RiskAssessment r WHERE r.riskCategory IN ('HIGH', 'CRITICAL')")
    long countHighRiskPatients();

    @org.springframework.data.jpa.repository.Query("SELECT r.riskCategory, COUNT(r) FROM RiskAssessment r WHERE r.hospital.id = :hospitalId GROUP BY r.riskCategory")
    List<Object[]> countByRiskCategoryAndHospitalId(@org.springframework.data.repository.query.Param("hospitalId") Long hospitalId);

    @org.springframework.data.jpa.repository.Query("SELECT r.riskCategory, COUNT(r) FROM RiskAssessment r GROUP BY r.riskCategory")
    List<Object[]> countByRiskCategory();

    @org.springframework.data.jpa.repository.Query("SELECT CAST(r.generatedAt AS date), COUNT(r) FROM RiskAssessment r WHERE r.hospital.id = :hospitalId AND r.generatedAt >= :since GROUP BY CAST(r.generatedAt AS date)")
    List<Object[]> countByDaySinceAndHospitalId(@org.springframework.data.repository.query.Param("since") java.time.ZonedDateTime since, @org.springframework.data.repository.query.Param("hospitalId") Long hospitalId);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(r.generatedAt AS date), COUNT(r) FROM RiskAssessment r WHERE r.generatedAt >= :since GROUP BY CAST(r.generatedAt AS date)")
    List<Object[]> countByDaySince(@org.springframework.data.repository.query.Param("since") java.time.ZonedDateTime since);
}
