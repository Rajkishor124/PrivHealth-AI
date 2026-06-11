package com.privhealth.backend.emr.repository;

import com.privhealth.backend.emr.entity.MedicalReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {

    Optional<MedicalReport> findById(Long id);

    Page<MedicalReport> findByPatientId(Long patientId, Pageable pageable);
}
