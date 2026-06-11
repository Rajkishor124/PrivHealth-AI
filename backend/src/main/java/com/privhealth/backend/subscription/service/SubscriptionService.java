package com.privhealth.backend.subscription.service;

import com.privhealth.backend.common.exception.PlanLimitExceededException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.common.exception.SubscriptionExpiredException;
import com.privhealth.backend.hospital.dto.HospitalRequest;
import com.privhealth.backend.hospital.dto.HospitalResponse;
import com.privhealth.backend.hospital.entity.Hospital;
import com.privhealth.backend.hospital.repository.HospitalRepository;
import com.privhealth.backend.hospital.service.HospitalService;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.entity.StaffStatus;
import com.privhealth.backend.user.repository.UserRepository;
import com.privhealth.backend.subscription.dto.*;
import com.privhealth.backend.subscription.entity.HospitalSubscription;
import com.privhealth.backend.subscription.entity.SubscriptionPlan;
import com.privhealth.backend.subscription.entity.SubscriptionStatus;
import com.privhealth.backend.subscription.entity.UsageMetrics;
import com.privhealth.backend.subscription.repository.HospitalSubscriptionRepository;
import com.privhealth.backend.subscription.repository.SubscriptionPlanRepository;
import com.privhealth.backend.subscription.repository.UsageMetricsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final HospitalSubscriptionRepository hospitalSubscriptionRepository;
    private final UsageMetricsRepository usageMetricsRepository;
    private final HospitalService hospitalService;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // --- Subscription Plan Management ---

    public List<SubscriptionPlanResponse> getAllPlans() {
        return subscriptionPlanRepository.findAll().stream()
                .map(this::mapToPlanResponse)
                .collect(Collectors.toList());
    }

    public SubscriptionPlanResponse getPlanById(Long id) {
        return mapToPlanResponse(findPlanEntityById(id));
    }

    @Transactional
    public SubscriptionPlanResponse createPlan(SubscriptionPlanRequest request) {
        SubscriptionPlan plan = SubscriptionPlan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .maxDoctors(request.getMaxDoctors())
                .maxPatients(request.getMaxPatients())
                .maxStorageGB(request.getMaxStorageGB())
                .maxPredictionsPerMonth(request.getMaxPredictionsPerMonth())
                .monthlyPrice(request.getMonthlyPrice())
                .yearlyPrice(request.getYearlyPrice())
                .active(request.isActive())
                .build();
        return mapToPlanResponse(subscriptionPlanRepository.save(plan));
    }

    @Transactional
    public SubscriptionPlanResponse updatePlan(Long id, SubscriptionPlanRequest request) {
        SubscriptionPlan plan = findPlanEntityById(id);
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setMaxDoctors(request.getMaxDoctors());
        plan.setMaxPatients(request.getMaxPatients());
        plan.setMaxStorageGB(request.getMaxStorageGB());
        plan.setMaxPredictionsPerMonth(request.getMaxPredictionsPerMonth());
        plan.setMonthlyPrice(request.getMonthlyPrice());
        plan.setYearlyPrice(request.getYearlyPrice());
        plan.setActive(request.isActive());
        return mapToPlanResponse(subscriptionPlanRepository.save(plan));
    }

    private SubscriptionPlan findPlanEntityById(Long id) {
        return subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription Plan not found"));
    }

    // --- Hospital Onboarding ---

    @Transactional
    public OnboardHospitalResponse onboardHospital(OnboardHospitalRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        // 1. Create Hospital
        HospitalRequest hospitalRequest = HospitalRequest.builder()
                .name(request.getName())
                .address(request.getAddress())
                .contactPhone(request.getContactNumber())
                .contactEmail(request.getAdminEmail())
                .build();
        HospitalResponse hospitalResponse = hospitalService.createHospital(hospitalRequest, httpRequest);
        Hospital hospital = hospitalRepository.findById(hospitalResponse.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found after creation"));

        // 2. Assign Subscription
        SubscriptionPlan plan = findPlanEntityById(request.getSubscriptionPlanId());
        
        HospitalSubscription subscription = HospitalSubscription.builder()
                .hospital(hospital)
                .subscriptionPlan(plan)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1)) // default 1 year
                .status(SubscriptionStatus.ACTIVE)
                .autoRenew(true)
                .build();
        hospitalSubscriptionRepository.save(subscription);

        // 3. Initialize Usage Metrics
        UsageMetrics metrics = UsageMetrics.builder()
                .hospital(hospital)
                .currentDoctors(1) // the admin
                .currentPatients(0)
                .currentStorageUsageGb(java.math.BigDecimal.ZERO)
                .currentPredictions(0)
                .currentAppointments(0)
                .currentConsultations(0)
                .billingCycleStart(LocalDate.now())
                .billingCycleEnd(LocalDate.now().plusMonths(1))
                .build();
        usageMetricsRepository.save(metrics);

        // 4. Create Hospital Admin User
        User admin = User.builder()
                .name("Admin " + request.getName())
                .email(request.getAdminEmail())
                .password(passwordEncoder.encode(request.getAdminPassword()))
                .role(Role.HOSPITAL_ADMIN)
                .staffStatus(StaffStatus.ACTIVE)
                .hospitalId(hospital.getId())
                .build();
        userRepository.save(admin);

        return OnboardHospitalResponse.builder()
                .hospital(hospitalResponse)
                .subscription(mapToSubscriptionResponse(subscription))
                .adminEmail(request.getAdminEmail())
                .build();
    }

    // --- Subscription & Usage Details ---

    public HospitalSubscriptionResponse getHospitalSubscription(Long hospitalId) {
        HospitalSubscription subscription = hospitalSubscriptionRepository.findTopByHospitalIdOrderByCreatedAtDesc(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("No subscription found for hospital"));
        return mapToSubscriptionResponse(subscription);
    }

    public TenantUsageResponse getTenantUsage(Long hospitalId) {
        UsageMetrics metrics = getUsageMetrics(hospitalId);
        HospitalSubscription subscription = getActiveSubscription(hospitalId);
        SubscriptionPlan plan = subscription.getSubscriptionPlan();

        return TenantUsageResponse.builder()
                .hospitalId(hospitalId)
                .currentDoctors(metrics.getCurrentDoctors())
                .currentPatients(metrics.getCurrentPatients())
                .currentStorageUsageGb(metrics.getCurrentStorageUsageGb())
                .currentPredictions(metrics.getCurrentPredictions())
                .currentAppointments(metrics.getCurrentAppointments())
                .currentConsultations(metrics.getCurrentConsultations())
                .billingCycleStart(metrics.getBillingCycleStart())
                .billingCycleEnd(metrics.getBillingCycleEnd())
                .maxDoctors(plan.getMaxDoctors())
                .maxPatients(plan.getMaxPatients())
                .maxStorageGB(plan.getMaxStorageGB())
                .maxPredictionsPerMonth(plan.getMaxPredictionsPerMonth())
                .build();
    }

    public PlatformAnalyticsResponse getPlatformAnalytics() {
        long totalHospitals = hospitalRepository.count();
        long totalActiveSubscriptions = hospitalSubscriptionRepository.count(); // could be filtered by status
        
        long totalDoctors = 0;
        long totalPatients = 0;
        long totalPredictions = 0;
        
        List<UsageMetrics> allMetrics = usageMetricsRepository.findAll();
        for (UsageMetrics m : allMetrics) {
            totalDoctors += m.getCurrentDoctors();
            totalPatients += m.getCurrentPatients();
            totalPredictions += m.getCurrentPredictions();
        }

        return PlatformAnalyticsResponse.builder()
                .totalHospitals(totalHospitals)
                .totalActiveSubscriptions(totalActiveSubscriptions)
                .totalDoctors(totalDoctors)
                .totalPatients(totalPatients)
                .totalPredictionsThisMonth(totalPredictions)
                .build();
    }

    // --- Limit Enforcement ---

    @Transactional
    public void validateAndIncrementDoctorCount(Long hospitalId) {
        validateSubscriptionActive(hospitalId);
        HospitalSubscription sub = getActiveSubscription(hospitalId);
        UsageMetrics metrics = getUsageMetrics(hospitalId);

        if (metrics.getCurrentDoctors() >= sub.getSubscriptionPlan().getMaxDoctors()) {
            throw new PlanLimitExceededException("Maximum number of doctors reached for your subscription plan. Please upgrade.");
        }
        metrics.setCurrentDoctors(metrics.getCurrentDoctors() + 1);
        usageMetricsRepository.save(metrics);
    }

    @Transactional
    public void validateAndIncrementPatientCount(Long hospitalId) {
        validateSubscriptionActive(hospitalId);
        HospitalSubscription sub = getActiveSubscription(hospitalId);
        UsageMetrics metrics = getUsageMetrics(hospitalId);

        if (metrics.getCurrentPatients() >= sub.getSubscriptionPlan().getMaxPatients()) {
            throw new PlanLimitExceededException("Maximum number of patients reached for your subscription plan. Please upgrade.");
        }
        metrics.setCurrentPatients(metrics.getCurrentPatients() + 1);
        usageMetricsRepository.save(metrics);
    }

    @Transactional
    public void validateAndIncrementPredictionCount(Long hospitalId) {
        validateSubscriptionActive(hospitalId);
        HospitalSubscription sub = getActiveSubscription(hospitalId);
        UsageMetrics metrics = getUsageMetrics(hospitalId);

        // Reset if new billing cycle
        if (LocalDate.now().isAfter(metrics.getBillingCycleEnd()) || LocalDate.now().isEqual(metrics.getBillingCycleEnd())) {
            metrics.setCurrentPredictions(0);
            metrics.setBillingCycleStart(LocalDate.now());
            metrics.setBillingCycleEnd(LocalDate.now().plusMonths(1));
        }

        if (metrics.getCurrentPredictions() >= sub.getSubscriptionPlan().getMaxPredictionsPerMonth()) {
            throw new PlanLimitExceededException("Maximum number of AI predictions for this month reached. Please upgrade.");
        }
        metrics.setCurrentPredictions(metrics.getCurrentPredictions() + 1);
        usageMetricsRepository.save(metrics);
    }

    private void validateSubscriptionActive(Long hospitalId) {
        HospitalSubscription sub = getActiveSubscription(hospitalId);
        if (sub.getEndDate().isBefore(LocalDate.now())) {
            throw new SubscriptionExpiredException("Your subscription has expired. Please renew to continue using the platform.");
        }
    }

    private HospitalSubscription getActiveSubscription(Long hospitalId) {
        return hospitalSubscriptionRepository.findActiveOrTrialByHospitalId(hospitalId)
                .orElseThrow(() -> new SubscriptionExpiredException("No active subscription found."));
    }

    private UsageMetrics getUsageMetrics(Long hospitalId) {
        return usageMetricsRepository.findByHospitalId(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Usage metrics not found for hospital."));
    }

    // --- Mappers ---

    private SubscriptionPlanResponse mapToPlanResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .maxDoctors(plan.getMaxDoctors())
                .maxPatients(plan.getMaxPatients())
                .maxStorageGB(plan.getMaxStorageGB())
                .maxPredictionsPerMonth(plan.getMaxPredictionsPerMonth())
                .monthlyPrice(plan.getMonthlyPrice())
                .yearlyPrice(plan.getYearlyPrice())
                .active(plan.isActive())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }

    private HospitalSubscriptionResponse mapToSubscriptionResponse(HospitalSubscription sub) {
        return HospitalSubscriptionResponse.builder()
                .id(sub.getId())
                .hospitalId(sub.getHospital().getId())
                .plan(mapToPlanResponse(sub.getSubscriptionPlan()))
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .status(sub.getStatus())
                .autoRenew(sub.isAutoRenew())
                .trialStartDate(sub.getTrialStartDate())
                .trialEndDate(sub.getTrialEndDate())
                .build();
    }
}
