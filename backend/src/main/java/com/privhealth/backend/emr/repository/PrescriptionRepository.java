package com.privhealth.backend.emr.repository;

import com.privhealth.backend.emr.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.medicines LEFT JOIN FETCH p.consultation c LEFT JOIN FETCH c.patient LEFT JOIN FETCH c.doctor WHERE p.id = :id")
    Optional<Prescription> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.medicines WHERE p.consultationId = :consultationId")
    List<Prescription> findByConsultationIdWithMedicines(@Param("consultationId") Long consultationId);

    @Query(value = "SELECT p FROM Prescription p LEFT JOIN FETCH p.medicines WHERE p.patientId = :patientId",
           countQuery = "SELECT COUNT(p) FROM Prescription p WHERE p.patientId = :patientId")
    Page<Prescription> findByPatientIdWithMedicines(@Param("patientId") Long patientId, Pageable pageable);

    long countByHospitalId(Long hospitalId);
}
