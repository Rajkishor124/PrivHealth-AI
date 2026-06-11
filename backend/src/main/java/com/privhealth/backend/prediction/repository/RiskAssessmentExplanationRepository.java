package com.privhealth.backend.prediction.repository;

import com.privhealth.backend.prediction.entity.RiskAssessmentExplanation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAssessmentExplanationRepository extends JpaRepository<RiskAssessmentExplanation, Long> {
    
    @Query("SELECT e.featureName as feature, COUNT(e) as count " +
           "FROM RiskAssessmentExplanation e " +
           "JOIN e.riskAssessment r " +
           "WHERE r.hospital.id = :hospitalId " +
           "GROUP BY e.featureName " +
           "ORDER BY count DESC")
    List<Object[]> findMostCommonRiskFactorsByHospitalId(@Param("hospitalId") Long hospitalId);

    @Query("SELECT e.featureName as feature, COUNT(e) as count " +
           "FROM RiskAssessmentExplanation e " +
           "GROUP BY e.featureName " +
           "ORDER BY count DESC")
    List<Object[]> findMostCommonRiskFactors();
}
