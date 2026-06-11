package com.privhealth.backend.emr.repository;

import com.privhealth.backend.emr.entity.TreatmentNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentNoteRepository extends JpaRepository<TreatmentNote, Long> {

    @Query("SELECT t FROM TreatmentNote t WHERE t.id = :id")
    Optional<TreatmentNote> findByIdWithDetails(@Param("id") Long id);

    List<TreatmentNote> findByConsultationId(Long consultationId);

    Page<TreatmentNote> findByPatientId(Long patientId, Pageable pageable);
}
