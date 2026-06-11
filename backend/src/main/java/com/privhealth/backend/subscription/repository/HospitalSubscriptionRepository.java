package com.privhealth.backend.subscription.repository;

import com.privhealth.backend.subscription.entity.HospitalSubscription;
import com.privhealth.backend.subscription.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalSubscriptionRepository extends JpaRepository<HospitalSubscription, Long> {

    @Query("SELECT hs FROM HospitalSubscription hs WHERE hs.hospitalId = :hospitalId AND hs.status IN ('ACTIVE', 'TRIAL')")
    Optional<HospitalSubscription> findActiveOrTrialByHospitalId(Long hospitalId);

    Optional<HospitalSubscription> findTopByHospitalIdOrderByCreatedAtDesc(Long hospitalId);

    List<HospitalSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDate date);
}
