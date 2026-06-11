package com.privhealth.backend.emr.repository;

import com.privhealth.backend.emr.entity.Diagnosis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> {

    @Query("SELECT d FROM Diagnosis d LEFT JOIN FETCH d.consultation c LEFT JOIN FETCH c.patient LEFT JOIN FETCH c.doctor WHERE d.id = :id")
    Optional<Diagnosis> findByIdWithDetails(@Param("id") Long id);

    List<Diagnosis> findByConsultationId(Long consultationId);

    Page<Diagnosis> findByPatientId(Long patientId, Pageable pageable);

    long countByHospitalId(Long hospitalId);
}
