package com.privhealth.backend.patient.repository;

import com.privhealth.backend.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.doctor WHERE p.id = :id")
    Optional<Patient> findByIdWithDoctor(@Param("id") Long id);

    @Query(value = "SELECT p FROM Patient p LEFT JOIN FETCH p.doctor WHERE p.doctorId = :doctorId " +
            "AND (:search IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')))",
            countQuery = "SELECT COUNT(p) FROM Patient p WHERE p.doctorId = :doctorId " +
                    "AND (:search IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Patient> findByDoctorIdWithSearch(@Param("doctorId") Long doctorId,
                                           @Param("search") String search,
                                           Pageable pageable);

    @Query(value = "SELECT p FROM Patient p LEFT JOIN FETCH p.doctor " +
            "WHERE (:search IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')))",
            countQuery = "SELECT COUNT(p) FROM Patient p " +
                    "WHERE (:search IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Patient> findAllWithSearch(@Param("search") String search, Pageable pageable);

    Optional<Patient> findByDoctorIdAndUserId(Long doctorId, Long userId);

    long countByDoctorId(Long doctorId);

    Optional<Patient> findByUserId(Long userId);

    @Query(value = "SELECT p FROM Patient p LEFT JOIN FETCH p.doctor WHERE p.hospitalId = :hospitalId " +
            "AND (:search IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')))",
            countQuery = "SELECT COUNT(p) FROM Patient p WHERE p.hospitalId = :hospitalId " +
                    "AND (:search IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Patient> findByHospitalIdWithSearch(@Param("hospitalId") Long hospitalId,
                                             @Param("search") String search,
                                             Pageable pageable);

    long countByHospitalId(Long hospitalId);
}
