package com.privhealth.backend.emr.repository;

import com.privhealth.backend.emr.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    @Query("SELECT c FROM Consultation c LEFT JOIN FETCH c.patient LEFT JOIN FETCH c.doctor WHERE c.id = :id")
    Optional<Consultation> findByIdWithDetails(@Param("id") Long id);

    @Query(value = "SELECT c FROM Consultation c LEFT JOIN FETCH c.patient LEFT JOIN FETCH c.doctor WHERE c.hospitalId = :hospitalId " +
            "AND (:search IS NULL OR LOWER(c.consultationNumber) LIKE LOWER(CONCAT('%', :search, '%')))",
            countQuery = "SELECT COUNT(c) FROM Consultation c WHERE c.hospitalId = :hospitalId " +
                    "AND (:search IS NULL OR LOWER(c.consultationNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Consultation> findByHospitalIdWithSearch(@Param("hospitalId") Long hospitalId, @Param("search") String search, Pageable pageable);

    @Query(value = "SELECT c FROM Consultation c LEFT JOIN FETCH c.patient LEFT JOIN FETCH c.doctor WHERE c.doctorId = :doctorId " +
            "AND (:search IS NULL OR LOWER(c.consultationNumber) LIKE LOWER(CONCAT('%', :search, '%')))",
            countQuery = "SELECT COUNT(c) FROM Consultation c WHERE c.doctorId = :doctorId " +
                    "AND (:search IS NULL OR LOWER(c.consultationNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Consultation> findByDoctorIdWithSearch(@Param("doctorId") Long doctorId, @Param("search") String search, Pageable pageable);

    Page<Consultation> findByPatientId(Long patientId, Pageable pageable);

    long countByHospitalId(Long hospitalId);
}
