package com.privhealth.backend.prediction.repository;

import com.privhealth.backend.prediction.entity.ModelRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModelRegistryRepository extends JpaRepository<ModelRegistry, Long> {
    Optional<ModelRegistry> findByIsActiveTrue();
}
