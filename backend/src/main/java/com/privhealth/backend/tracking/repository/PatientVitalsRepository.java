package com.privhealth.backend.tracking.repository;

import com.privhealth.backend.tracking.entity.PatientVitals;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientVitalsRepository extends JpaRepository<PatientVitals, Long> {
    Page<PatientVitals> findByPatientId(Long patientId, Pageable pageable);
    
    List<PatientVitals> findByPatientIdOrderByRecordedAtAsc(Long patientId);
    
    Optional<PatientVitals> findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);
    
    @Query("SELECT AVG(pv.bloodPressureSystolic) FROM PatientVitals pv WHERE pv.hospitalId = :hospitalId AND pv.bloodPressureSystolic IS NOT NULL")
    Double getAverageSystolicByHospitalId(@Param("hospitalId") Long hospitalId);
    
    @Query("SELECT AVG(pv.bloodPressureDiastolic) FROM PatientVitals pv WHERE pv.hospitalId = :hospitalId AND pv.bloodPressureDiastolic IS NOT NULL")
    Double getAverageDiastolicByHospitalId(@Param("hospitalId") Long hospitalId);
    
    @Query("SELECT AVG(pv.bloodSugar) FROM PatientVitals pv WHERE pv.hospitalId = :hospitalId AND pv.bloodSugar IS NOT NULL")
    Double getAverageBloodSugarByHospitalId(@Param("hospitalId") Long hospitalId);

    @Query("SELECT COUNT(DISTINCT pv.patientId) FROM PatientVitals pv WHERE pv.hospitalId = :hospitalId")
    long countUniquePatientsByHospitalId(@Param("hospitalId") Long hospitalId);
}
