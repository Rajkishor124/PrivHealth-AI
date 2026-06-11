package com.privhealth.backend.prediction.repository;

import com.privhealth.backend.prediction.entity.Prediction;
import com.privhealth.backend.prediction.entity.RiskCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    @Query("SELECT p FROM Prediction p JOIN FETCH p.patient WHERE p.id = :id")
    Optional<Prediction> findByIdWithPatient(@Param("id") Long id);

    Optional<Prediction> findTopByPatientIdOrderByCreatedAtDesc(Long patientId);

    @Query("SELECT p FROM Prediction p JOIN FETCH p.patient WHERE p.patientId = :patientId ORDER BY p.createdAt DESC")
    List<Prediction> findByPatientIdWithPatient(@Param("patientId") Long patientId);

    // Doctor scoped: predictions for patients belonging to this doctor
    @Query(value = "SELECT p FROM Prediction p JOIN FETCH p.patient pat WHERE pat.doctorId = :doctorId",
            countQuery = "SELECT COUNT(p) FROM Prediction p JOIN p.patient pat WHERE pat.doctorId = :doctorId")
    Page<Prediction> findByDoctorId(@Param("doctorId") Long doctorId, Pageable pageable);

    // Patient scoped
    @Query(value = "SELECT p FROM Prediction p JOIN FETCH p.patient pat WHERE pat.userId = :userId",
            countQuery = "SELECT COUNT(p) FROM Prediction p JOIN p.patient pat WHERE pat.userId = :userId")
    Page<Prediction> findByPatientUserId(@Param("userId") Long userId, Pageable pageable);

    // Admin: all
    @Query(value = "SELECT p FROM Prediction p JOIN FETCH p.patient",
            countQuery = "SELECT COUNT(p) FROM Prediction p")
    Page<Prediction> findAllWithPatient(Pageable pageable);

    // Analytics
    @Query("SELECT p.riskCategory, COUNT(p) FROM Prediction p GROUP BY p.riskCategory")
    List<Object[]> countByRiskCategory();

    @Query("SELECT CAST(p.createdAt AS LocalDate), COUNT(p) FROM Prediction p WHERE p.createdAt >= :since GROUP BY CAST(p.createdAt AS LocalDate) ORDER BY CAST(p.createdAt AS LocalDate)")
    List<Object[]> countByDaySince(@Param("since") Instant since);

    @Query(value = "SELECT p FROM Prediction p JOIN FETCH p.patient pat WHERE p.hospitalId = :hospitalId",
            countQuery = "SELECT COUNT(p) FROM Prediction p WHERE p.hospitalId = :hospitalId")
    Page<Prediction> findByHospitalId(@Param("hospitalId") Long hospitalId, Pageable pageable);

    @Query("SELECT p.riskCategory, COUNT(p) FROM Prediction p WHERE p.hospitalId = :hospitalId GROUP BY p.riskCategory")
    List<Object[]> countByRiskCategoryAndHospitalId(@Param("hospitalId") Long hospitalId);

    @Query("SELECT CAST(p.createdAt AS LocalDate), COUNT(p) FROM Prediction p WHERE p.hospitalId = :hospitalId AND p.createdAt >= :since GROUP BY CAST(p.createdAt AS LocalDate) ORDER BY CAST(p.createdAt AS LocalDate)")
    List<Object[]> countByDaySinceAndHospitalId(@Param("since") Instant since, @Param("hospitalId") Long hospitalId);

    long countByHospitalId(Long hospitalId);
}
