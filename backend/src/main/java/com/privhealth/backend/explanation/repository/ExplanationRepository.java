package com.privhealth.backend.explanation.repository;

import com.privhealth.backend.explanation.entity.Explanation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExplanationRepository extends JpaRepository<Explanation, Long> {

    @Query("SELECT e FROM Explanation e WHERE e.predictionId = :predictionId ORDER BY ABS(e.contribution) DESC")
    List<Explanation> findByPredictionIdOrderByAbsContribution(@Param("predictionId") Long predictionId);

    List<Explanation> findByPredictionId(Long predictionId);
}
