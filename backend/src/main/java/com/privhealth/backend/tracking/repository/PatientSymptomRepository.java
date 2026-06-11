package com.privhealth.backend.tracking.repository;

import com.privhealth.backend.tracking.entity.PatientSymptom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PatientSymptomRepository extends JpaRepository<PatientSymptom, Long> {
    Page<PatientSymptom> findByPatientId(Long patientId, Pageable pageable);
    
    @Query("SELECT ps.symptom.name as name, COUNT(ps) as count FROM PatientSymptom ps WHERE ps.hospitalId = :hospitalId AND ps.recordedAt >= :since GROUP BY ps.symptom.name ORDER BY COUNT(ps) DESC")
    List<Object[]> findTopSymptomsByHospitalIdSince(@Param("hospitalId") Long hospitalId, @Param("since") Instant since, Pageable pageable);
    
    @Query("SELECT COUNT(DISTINCT ps.patientId) FROM PatientSymptom ps WHERE ps.hospitalId = :hospitalId")
    long countUniquePatientsByHospitalId(@Param("hospitalId") Long hospitalId);
}
