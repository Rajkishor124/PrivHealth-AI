package com.privhealth.backend.appointment.service;

import com.privhealth.backend.appointment.dto.AppointmentAnalyticsResponse;
import com.privhealth.backend.appointment.dto.PatientQueueResponse;
import com.privhealth.backend.appointment.dto.QueueDashboardResponse;
import com.privhealth.backend.appointment.entity.*;
import com.privhealth.backend.appointment.repository.AppointmentRepository;
import com.privhealth.backend.appointment.repository.PatientQueueRepository;
import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientQueueService {

    private final PatientQueueRepository queueRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditService auditService;

    private Instant startOfToday() {
        return ZonedDateTime.now(ZoneId.systemDefault()).toLocalDate().atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    private Instant endOfToday() {
        return ZonedDateTime.now(ZoneId.systemDefault()).toLocalDate().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    @Transactional
    public void addToQueue(Appointment appointment, HttpServletRequest httpRequest) {
        Instant start = startOfToday();
        Instant end = endOfToday();

        int maxPos = queueRepository.findMaxQueuePositionByDoctorIdAndDate(appointment.getDoctorId(), start, end);
        int newPosition = maxPos + 1;
        String tokenNumber = "A-" + String.format("%03d", newPosition);

        PatientQueue queue = PatientQueue.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .hospitalId(appointment.getHospitalId())
                .tokenNumber(tokenNumber)
                .queuePosition(newPosition)
                .status(QueueStatus.WAITING)
                .checkInTime(Instant.now())
                .build();

        queueRepository.save(queue);

        auditService.log("PATIENT_ADDED_TO_QUEUE", "QUEUE", queue.getId(),
                "Token: " + tokenNumber + ", Position: " + newPosition, httpRequest);
    }

    @Transactional
    public PatientQueueResponse callNext(UserPrincipal principal, HttpServletRequest httpRequest) {
        Instant start = startOfToday();
        Instant end = endOfToday();

        List<PatientQueue> waiting = queueRepository.findByDoctorIdAndStatusAndDate(
                principal.getId(), QueueStatus.WAITING, start, end);

        if (waiting.isEmpty()) {
            throw new BadRequestException("No patients waiting in queue");
        }

        PatientQueue next = waiting.get(0);
        next.setStatus(QueueStatus.CALLED);
        next.setCalledTime(Instant.now());
        queueRepository.save(next);

        // Update appointment status
        Appointment appointment = appointmentRepository.findById(next.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.CHECKED_IN);
            appointmentRepository.save(appointment);
        }

        auditService.log("PATIENT_CALLED", "QUEUE", next.getId(),
                "Called patient token " + next.getTokenNumber(), httpRequest);

        return mapToResponse(next);
    }

    @Transactional
    public PatientQueueResponse startConsultation(UserPrincipal principal, Long queueId, HttpServletRequest httpRequest) {
        PatientQueue queue = queueRepository.findByIdWithDetails(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found"));

        if (!queue.getDoctorId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Queue entry not found");
        }

        if (queue.getStatus() != QueueStatus.CALLED) {
            throw new BadRequestException("Patient must be called before starting consultation");
        }

        queue.setStatus(QueueStatus.IN_CONSULTATION);
        queue.setConsultationStartTime(Instant.now());
        queueRepository.save(queue);

        // Update appointment
        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.IN_CONSULTATION);
            appointmentRepository.save(appointment);
        }

        auditService.log("CONSULTATION_STARTED", "QUEUE", queue.getId(),
                "Started consultation for token " + queue.getTokenNumber(), httpRequest);

        return mapToResponse(queue);
    }

    @Transactional
    public PatientQueueResponse complete(UserPrincipal principal, Long queueId, HttpServletRequest httpRequest) {
        PatientQueue queue = queueRepository.findByIdWithDetails(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found"));

        if (!queue.getDoctorId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Queue entry not found");
        }

        if (queue.getStatus() != QueueStatus.IN_CONSULTATION) {
            throw new BadRequestException("Can only complete entries that are in consultation");
        }

        queue.setStatus(QueueStatus.COMPLETED);
        queue.setCompletedTime(Instant.now());
        queueRepository.save(queue);

        // Update appointment
        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        }

        auditService.log("CONSULTATION_COMPLETED", "QUEUE", queue.getId(),
                "Completed consultation for token " + queue.getTokenNumber(), httpRequest);

        return mapToResponse(queue);
    }

    @Transactional
    public PatientQueueResponse skip(UserPrincipal principal, Long queueId, HttpServletRequest httpRequest) {
        PatientQueue queue = queueRepository.findByIdWithDetails(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found"));

        if (!queue.getDoctorId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Queue entry not found");
        }

        queue.setStatus(QueueStatus.SKIPPED);
        queue.setCompletedTime(Instant.now());
        queueRepository.save(queue);

        auditService.log("PATIENT_SKIPPED", "QUEUE", queue.getId(),
                "Skipped patient token " + queue.getTokenNumber(), httpRequest);

        return mapToResponse(queue);
    }

    @Transactional(readOnly = true)
    public QueueDashboardResponse getDoctorDashboard(UserPrincipal principal) {
        Instant start = startOfToday();
        Instant end = endOfToday();

        List<PatientQueue> todayQueue = queueRepository.findByDoctorIdAndDate(principal.getId(), start, end);

        long waiting = todayQueue.stream().filter(q -> q.getStatus() == QueueStatus.WAITING).count();
        long called = todayQueue.stream().filter(q -> q.getStatus() == QueueStatus.CALLED).count();
        long inConsultation = todayQueue.stream().filter(q -> q.getStatus() == QueueStatus.IN_CONSULTATION).count();
        long completed = todayQueue.stream().filter(q -> q.getStatus() == QueueStatus.COMPLETED).count();
        long skipped = todayQueue.stream().filter(q -> q.getStatus() == QueueStatus.SKIPPED).count();

        PatientQueueResponse currentPatient = todayQueue.stream()
                .filter(q -> q.getStatus() == QueueStatus.IN_CONSULTATION || q.getStatus() == QueueStatus.CALLED)
                .findFirst()
                .map(this::mapToResponse)
                .orElse(null);

        return QueueDashboardResponse.builder()
                .totalToday(todayQueue.size())
                .waiting(waiting)
                .called(called)
                .inConsultation(inConsultation)
                .completed(completed)
                .skipped(skipped)
                .currentPatient(currentPatient)
                .queue(todayQueue.stream().map(this::mapToResponse).collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<PatientQueueResponse> getDoctorQueue(UserPrincipal principal) {
        Instant start = startOfToday();
        Instant end = endOfToday();
        return queueRepository.findByDoctorIdAndDate(principal.getId(), start, end)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentAnalyticsResponse getHospitalAnalytics(UserPrincipal principal) {
        LocalDate today = LocalDate.now();
        Instant start = startOfToday();
        Instant end = endOfToday();

        long totalAppointments = appointmentRepository.countByHospitalId(principal.getHospitalId());
        long todayAppointments = appointmentRepository.countByHospitalIdAndAppointmentDate(principal.getHospitalId(), today);
        long todayCheckedIn = appointmentRepository.countByHospitalIdAndAppointmentDateAndStatus(principal.getHospitalId(), today, AppointmentStatus.IN_QUEUE);
        long todayWaiting = queueRepository.countByHospitalIdAndStatusAndDate(principal.getHospitalId(), QueueStatus.WAITING, start, end);
        long todayInConsultation = queueRepository.countByHospitalIdAndStatusAndDate(principal.getHospitalId(), QueueStatus.IN_CONSULTATION, start, end);
        long todayCompleted = appointmentRepository.countByHospitalIdAndAppointmentDateAndStatus(principal.getHospitalId(), today, AppointmentStatus.COMPLETED);
        long todayCancelled = appointmentRepository.countByHospitalIdAndAppointmentDateAndStatus(principal.getHospitalId(), today, AppointmentStatus.CANCELLED);
        long todayNoShow = appointmentRepository.countByHospitalIdAndAppointmentDateAndStatus(principal.getHospitalId(), today, AppointmentStatus.NO_SHOW);

        List<Object[]> utilRows = appointmentRepository.getDoctorUtilization(principal.getHospitalId(), today);
        List<AppointmentAnalyticsResponse.DoctorUtilization> utilization = utilRows.stream()
                .map(row -> AppointmentAnalyticsResponse.DoctorUtilization.builder()
                        .doctorId((Long) row[0])
                        .doctorName((String) row[1])
                        .totalAppointments((Long) row[2])
                        .completed((Long) row[3])
                        .waiting((Long) row[4])
                        .build())
                .collect(Collectors.toList());

        return AppointmentAnalyticsResponse.builder()
                .totalAppointments(totalAppointments)
                .todayAppointments(todayAppointments)
                .todayCheckedIn(todayCheckedIn)
                .todayWaiting(todayWaiting)
                .todayInConsultation(todayInConsultation)
                .todayCompleted(todayCompleted)
                .todayCancelled(todayCancelled)
                .todayNoShow(todayNoShow)
                .doctorUtilization(utilization)
                .build();
    }

    private PatientQueueResponse mapToResponse(PatientQueue pq) {
        return PatientQueueResponse.builder()
                .id(pq.getId())
                .appointmentId(pq.getAppointmentId())
                .appointmentNumber(pq.getAppointment() != null ? pq.getAppointment().getAppointmentNumber() : null)
                .patientId(pq.getPatientId())
                .patientName(pq.getPatient() != null ? pq.getPatient().getFirstName() + " " + pq.getPatient().getLastName() : null)
                .doctorId(pq.getDoctorId())
                .doctorName(pq.getDoctor() != null ? pq.getDoctor().getName() : null)
                .tokenNumber(pq.getTokenNumber())
                .queuePosition(pq.getQueuePosition())
                .status(pq.getStatus())
                .checkInTime(pq.getCheckInTime() != null ? pq.getCheckInTime().toString() : null)
                .calledTime(pq.getCalledTime() != null ? pq.getCalledTime().toString() : null)
                .consultationStartTime(pq.getConsultationStartTime() != null ? pq.getConsultationStartTime().toString() : null)
                .completedTime(pq.getCompletedTime() != null ? pq.getCompletedTime().toString() : null)
                .reasonForVisit(pq.getAppointment() != null ? pq.getAppointment().getReasonForVisit() : null)
                .build();
    }
}
