package com.privhealth.backend.admin.service;

import com.privhealth.backend.admin.dto.AnalyticsResponse;
import com.privhealth.backend.admin.dto.AuditLogResponse;
import com.privhealth.backend.audit.entity.AuditLog;
import com.privhealth.backend.audit.repository.AuditLogRepository;
import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.ConflictException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.appointment.entity.AppointmentStatus;
import com.privhealth.backend.appointment.entity.QueueStatus;
import com.privhealth.backend.appointment.repository.AppointmentRepository;
import com.privhealth.backend.appointment.repository.PatientQueueRepository;
import com.privhealth.backend.emr.repository.ConsultationRepository;
import com.privhealth.backend.emr.repository.DiagnosisRepository;
import com.privhealth.backend.emr.repository.PrescriptionRepository;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.prediction.entity.RiskCategory;
import com.privhealth.backend.prediction.repository.RiskAssessmentRepository;
import com.privhealth.backend.prediction.repository.RiskAssessmentExplanationRepository;
import com.privhealth.backend.tracking.entity.AlertSeverity;
import com.privhealth.backend.tracking.repository.HealthAlertRepository;
import com.privhealth.backend.tracking.repository.HealthJournalRepository;
import com.privhealth.backend.tracking.repository.PatientSymptomRepository;
import com.privhealth.backend.tracking.repository.PatientVitalsRepository;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.user.dto.UserResponse;
import com.privhealth.backend.user.entity.StaffStatus;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.mapper.UserMapper;
import com.privhealth.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAssessmentExplanationRepository explanationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditService auditService;
    private final ConsultationRepository consultationRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepo;
    private final PatientQueueRepository queueRepo;
    private final PatientSymptomRepository patientSymptomRepository;
    private final PatientVitalsRepository patientVitalsRepository;
    private final HealthJournalRepository healthJournalRepository;
    private final HealthAlertRepository healthAlertRepository;

    // ── Doctor Approval ──

    @Transactional(readOnly = true)
    public List<UserResponse> getPendingDoctors(UserPrincipal principal) {
        if (principal.isSuperAdmin()) {
            return userRepository.findByRoleAndStaffStatusOrderByCreatedAtAsc(Role.DOCTOR, StaffStatus.PENDING)
                    .stream()
                    .map(UserMapper::toResponse)
                    .collect(Collectors.toList());
        } else {
            return userRepository.findByRoleAndStaffStatusAndHospitalIdOrderByCreatedAtAsc(
                    Role.DOCTOR, StaffStatus.PENDING, principal.getHospitalId())
                    .stream()
                    .map(UserMapper::toResponse)
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public UserResponse approveDoctor(UserPrincipal principal, Long id, HttpServletRequest httpRequest) {
        User doctor = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));

        if (!principal.isSuperAdmin() && !doctor.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Pending doctor", id);
        }

        if (doctor.getRole() != Role.DOCTOR || doctor.getStaffStatus() != StaffStatus.PENDING) {
            throw new ResourceNotFoundException("Pending doctor", id);
        }

        doctor.setStaffStatus(StaffStatus.APPROVED);
        userRepository.save(doctor);

        auditService.log("DOCTOR_APPROVED", "USER", id, null, httpRequest);

        return UserMapper.toResponse(doctor);
    }

    @Transactional
    public UserResponse rejectDoctor(UserPrincipal principal, Long id, HttpServletRequest httpRequest) {
        User doctor = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));

        if (!principal.isSuperAdmin() && !doctor.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Pending doctor", id);
        }

        if (doctor.getRole() != Role.DOCTOR || doctor.getStaffStatus() != StaffStatus.PENDING) {
            throw new ResourceNotFoundException("Pending doctor", id);
        }

        doctor.setStaffStatus(StaffStatus.REJECTED);
        userRepository.save(doctor);

        auditService.log("DOCTOR_REJECTED", "USER", id, null, httpRequest);

        return UserMapper.toResponse(doctor);
    }

    // ── User Management ──

    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(UserPrincipal principal, String role, Pageable pageable) {
        Page<User> users;
        if (principal.isSuperAdmin()) {
            if (role != null && !role.isBlank()) {
                users = userRepository.findByRole(Role.valueOf(role.toUpperCase()), pageable);
            } else {
                users = userRepository.findAll(pageable);
            }
        } else {
            if (role != null && !role.isBlank()) {
                users = userRepository.findByRoleAndHospitalId(Role.valueOf(role.toUpperCase()), principal.getHospitalId(), pageable);
            } else {
                users = userRepository.findByHospitalId(principal.getHospitalId(), pageable);
            }
        }
        return users.map(UserMapper::toResponse);
    }

    @Transactional
    public void deleteUser(UserPrincipal principal, Long id, HttpServletRequest httpRequest) {
        if (principal.getId().equals(id)) {
            throw new ConflictException("Cannot delete your own account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (!principal.isSuperAdmin() && !user.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("User", id);
        }

        // Cannot delete the last remaining admin
        if (user.getRole() == Role.SUPER_ADMIN) {
            long adminCount = userRepository.countByRole(Role.SUPER_ADMIN);
            if (adminCount <= 1) {
                throw new ConflictException("Cannot delete the last remaining super admin");
            }
        }

        // Doctor with patients: block deletion
        if (user.getRole() == Role.DOCTOR) {
            long patientCount = patientRepository.countByDoctorId(id);
            if (patientCount > 0) {
                throw new ConflictException("Doctor has assigned patients");
            }
        }

        // Patient user: unlink from patient records
        if (user.getRole() == Role.PATIENT) {
            patientRepository.findByUserId(id).ifPresent(patient -> {
                patient.setUserId(null);
                patientRepository.save(patient);
            });
        }

        userRepository.delete(user);

        auditService.log("USER_DELETED", "USER", id, "Deleted user: " + user.getEmail(), httpRequest);
    }

    // ── Analytics ──

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(UserPrincipal principal) {
        long totalUsers = 0;
        long totalDoctors = 0;
        long pendingDoctors = 0;
        long totalPatients = 0;
        long totalPredictions = 0;
        long totalReceptionists = 0;
        long totalTechnicians = 0;
        long totalActiveStaff = 0;
        long totalConsultations = 0;
        long totalDiagnoses = 0;
        long totalPrescriptions = 0;

        if (principal.isSuperAdmin()) {
            totalUsers = userRepository.count();
            totalDoctors = userRepository.countByRole(Role.DOCTOR);
            pendingDoctors = userRepository.countByRoleAndStaffStatus(Role.DOCTOR, StaffStatus.PENDING);
            totalPatients = patientRepository.count();
            totalPredictions = riskAssessmentRepository.count();
            totalReceptionists = userRepository.countByRole(Role.RECEPTIONIST);
            totalTechnicians = userRepository.countByRole(Role.TECHNICIAN);
            totalActiveStaff = userRepository.countByStaffStatus(StaffStatus.ACTIVE);
            totalConsultations = consultationRepository.count();
            totalDiagnoses = diagnosisRepository.count();
            totalPrescriptions = prescriptionRepository.count();
        } else {
            totalUsers = userRepository.countByHospitalId(principal.getHospitalId());
            totalDoctors = userRepository.countByRoleAndHospitalId(Role.DOCTOR, principal.getHospitalId());
            pendingDoctors = userRepository.countByRoleAndStaffStatusAndHospitalId(Role.DOCTOR, StaffStatus.PENDING, principal.getHospitalId());
            totalPatients = patientRepository.countByHospitalId(principal.getHospitalId());
            totalPredictions = riskAssessmentRepository.countByHospitalId(principal.getHospitalId());
            totalReceptionists = userRepository.countByRoleAndHospitalId(Role.RECEPTIONIST, principal.getHospitalId());
            totalTechnicians = userRepository.countByRoleAndHospitalId(Role.TECHNICIAN, principal.getHospitalId());
            totalActiveStaff = userRepository.countByStaffStatusAndHospitalId(StaffStatus.ACTIVE, principal.getHospitalId());
            totalConsultations = consultationRepository.countByHospitalId(principal.getHospitalId());
            totalDiagnoses = diagnosisRepository.countByHospitalId(principal.getHospitalId());
            totalPrescriptions = prescriptionRepository.countByHospitalId(principal.getHospitalId());
        }
        
        long patientsTrackingSymptoms = 0;
        long patientsTrackingVitals = 0;
        long patientsJournaling = 0;
        long activeCriticalAlerts = 0;
        Double avgSystolic = null;
        Double avgDiastolic = null;
        Double avgBloodSugar = null;

        if (!principal.isSuperAdmin()) {
            patientsTrackingSymptoms = patientSymptomRepository.countUniquePatientsByHospitalId(principal.getHospitalId());
            patientsTrackingVitals = patientVitalsRepository.countUniquePatientsByHospitalId(principal.getHospitalId());
            patientsJournaling = healthJournalRepository.countUniquePatientsByHospitalId(principal.getHospitalId());
            activeCriticalAlerts = healthAlertRepository.countByHospitalIdAndSeverity(principal.getHospitalId(), AlertSeverity.CRITICAL);
            avgSystolic = patientVitalsRepository.getAverageSystolicByHospitalId(principal.getHospitalId());
            avgDiastolic = patientVitalsRepository.getAverageDiastolicByHospitalId(principal.getHospitalId());
            avgBloodSugar = patientVitalsRepository.getAverageBloodSugarByHospitalId(principal.getHospitalId());
        }

        // Risk distribution
        Map<RiskCategory, Long> riskDistribution = new LinkedHashMap<>();
        riskDistribution.put(RiskCategory.LOW, 0L);
        riskDistribution.put(RiskCategory.MODERATE, 0L);
        riskDistribution.put(RiskCategory.HIGH, 0L);

        List<Object[]> riskRows = principal.isSuperAdmin() ? 
                riskAssessmentRepository.countByRiskCategory() :
                riskAssessmentRepository.countByRiskCategoryAndHospitalId(principal.getHospitalId());

        riskRows.forEach(row -> {
            RiskCategory cat = (RiskCategory) row[0];
            Long count = (Long) row[1];
            riskDistribution.put(cat, count);
        });

        // Predictions last 30 days
        Instant thirtyDaysAgo = Instant.now().minus(java.time.Duration.ofDays(30));
        Map<LocalDate, Long> dailyCounts = new LinkedHashMap<>();

        // Fill all 30 days with 0
        for (int i = 29; i >= 0; i--) {
            dailyCounts.put(LocalDate.now(ZoneOffset.UTC).minusDays(i), 0L);
        }

        List<Object[]> dateRows = principal.isSuperAdmin() ?
                riskAssessmentRepository.countByDaySince(thirtyDaysAgo.atZone(ZoneOffset.UTC)) :
                riskAssessmentRepository.countByDaySinceAndHospitalId(thirtyDaysAgo.atZone(ZoneOffset.UTC), principal.getHospitalId());

        dateRows.forEach(row -> {
            LocalDate date = (LocalDate) row[0];
            Long count = (Long) row[1];
            dailyCounts.put(date, count);
        });

        List<AnalyticsResponse.DailyPredictionCount> last30Days = dailyCounts.entrySet().stream()
                .map(e -> AnalyticsResponse.DailyPredictionCount.builder()
                        .date(e.getKey().format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // Appointment analytics
        long totalAppointments = appointmentRepo.countByHospitalId(principal.getHospitalId());
        java.time.LocalDate today = java.time.LocalDate.now();
        long todayAppointments = appointmentRepo.countByHospitalIdAndAppointmentDate(principal.getHospitalId(), today);
        long todayCheckedIn = appointmentRepo.countByHospitalIdAndAppointmentDateAndStatus(principal.getHospitalId(), today, AppointmentStatus.IN_QUEUE);
        java.time.Instant startOfDay = today.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
        java.time.Instant endOfDay = today.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
        long todayWaiting = queueRepo.countByHospitalIdAndStatusAndDate(principal.getHospitalId(), QueueStatus.WAITING, startOfDay, endOfDay);
        long todayCompleted = appointmentRepo.countByHospitalIdAndAppointmentDateAndStatus(principal.getHospitalId(), today, AppointmentStatus.COMPLETED);

        long highRiskPatients = principal.isSuperAdmin() ? riskAssessmentRepository.countHighRiskPatients() : riskAssessmentRepository.countHighRiskPatientsByHospitalId(principal.getHospitalId());
        
        List<Object[]> explanationRows = principal.isSuperAdmin() ? explanationRepository.findMostCommonRiskFactors() : explanationRepository.findMostCommonRiskFactorsByHospitalId(principal.getHospitalId());
        Map<String, Long> mostCommonRiskFactors = new LinkedHashMap<>();
        explanationRows.stream().limit(5).forEach(row -> {
            mostCommonRiskFactors.put((String) row[0], (Long) row[1]);
        });

        return AnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .pendingDoctors(pendingDoctors)
                .totalPatients(totalPatients)
                .totalPredictions(totalPredictions)
                .totalReceptionists(totalReceptionists)
                .totalTechnicians(totalTechnicians)
                .totalActiveStaff(totalActiveStaff)
                .totalConsultations(totalConsultations)
                .totalDiagnoses(totalDiagnoses)
                .totalPrescriptions(totalPrescriptions)
                .totalAppointments(totalAppointments)
                .todayAppointments(todayAppointments)
                .todayCheckedIn(todayCheckedIn)
                .todayWaiting(todayWaiting)
                .todayCompleted(todayCompleted)
                .riskDistribution(riskDistribution)
                .predictionsLast30Days(last30Days)
                .patientsTrackingSymptoms(patientsTrackingSymptoms)
                .patientsTrackingVitals(patientsTrackingVitals)
                .patientsJournaling(patientsJournaling)
                .activeCriticalAlerts(activeCriticalAlerts)
                .avgSystolic(avgSystolic)
                .avgDiastolic(avgDiastolic)
                .avgBloodSugar(avgBloodSugar)
                .highRiskPatients(highRiskPatients)
                .mostCommonRiskFactors(mostCommonRiskFactors)
                .build();
    }

    // ── Audit Logs ──

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(UserPrincipal principal, Long userId, Pageable pageable) {
        Page<AuditLog> logs;
        if (principal.isSuperAdmin()) {
            if (userId != null) {
                logs = auditLogRepository.findByUserId(userId, pageable);
            } else {
                logs = auditLogRepository.findAll(pageable);
            }
        } else {
            logs = auditLogRepository.findAllWithUserByHospitalId(principal.getHospitalId(), userId, pageable);
        }

        return logs.map(a -> AuditLogResponse.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .userName(a.getUser() != null ? a.getUser().getName() : null)
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .details(a.getDetails())
                .ipAddress(a.getIpAddress())
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .build());
    }
}
