package com.privhealth.backend.tracking.repository;

import com.privhealth.backend.tracking.entity.SymptomMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomMasterRepository extends JpaRepository<SymptomMaster, Long> {
    List<SymptomMaster> findByActiveTrueOrderByNameAsc();
}
