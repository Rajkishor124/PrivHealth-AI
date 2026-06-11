package com.privhealth.backend.hospital.repository;

import com.privhealth.backend.hospital.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByHospitalCode(String hospitalCode);
    boolean existsByHospitalCode(String hospitalCode);
}
