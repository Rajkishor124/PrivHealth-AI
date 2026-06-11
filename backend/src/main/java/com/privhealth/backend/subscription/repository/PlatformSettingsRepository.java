package com.privhealth.backend.subscription.repository;

import com.privhealth.backend.subscription.entity.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, Long> {
}
