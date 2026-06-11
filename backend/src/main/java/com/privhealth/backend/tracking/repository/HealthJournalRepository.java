package com.privhealth.backend.tracking.repository;

import com.privhealth.backend.tracking.entity.HealthJournal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HealthJournalRepository extends JpaRepository<HealthJournal, Long> {
    Page<HealthJournal> findByPatientId(Long patientId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT hj.patientId) FROM HealthJournal hj WHERE hj.hospitalId = :hospitalId")
    long countUniquePatientsByHospitalId(@Param("hospitalId") Long hospitalId);
}
