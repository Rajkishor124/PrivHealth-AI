package com.privhealth.backend.appointment.service;

import com.privhealth.backend.appointment.dto.AppointmentRequest;
import com.privhealth.backend.appointment.dto.AppointmentResponse;
import com.privhealth.backend.appointment.dto.RescheduleRequest;
import com.privhealth.backend.appointment.entity.*;
import com.privhealth.backend.appointment.repository.AppointmentRepository;
import com.privhealth.backend.appointment.repository.DoctorAvailabilityRepository;
import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PatientQueueService queueService;
    private final AuditService auditService;

    @Transactional
    public AppointmentResponse create(UserPrincipal principal, AppointmentRequest request, HttpServletRequest httpRequest) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!patient.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Patient not found in your hospital");
        }

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctor.getRole() != Role.DOCTOR) {
            throw new BadRequestException("Selected user is not a doctor");
        }

        if (!doctor.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Doctor not found in your hospital");
        }

        LocalDate appointmentDate = LocalDate.parse(request.getAppointmentDate());
        LocalTime appointmentTime = LocalTime.parse(request.getAppointmentTime());

        // Validate appointment is not in the past
        if (appointmentDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book appointments in the past");
        }

        // Validate doctor availability for the day
        DayOfWeek dayOfWeek = appointmentDate.getDayOfWeek();
        DoctorAvailability availability = availabilityRepository.findByDoctorIdAndDayOfWeek(request.getDoctorId(), dayOfWeek)
                .orElseThrow(() -> new BadRequestException("Doctor is not available on " + dayOfWeek));

        if (!availability.getActive()) {
            throw new BadRequestException("Doctor is not available on " + dayOfWeek);
        }

        if (appointmentTime.isBefore(availability.getStartTime()) || appointmentTime.isAfter(availability.getEndTime())) {
            throw new BadRequestException("Appointment time is outside doctor's working hours (" + 
                availability.getStartTime() + " - " + availability.getEndTime() + ")");
        }

        // Check capacity
        List<AppointmentStatus> excludeStatuses = List.of(AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW);
        long booked = appointmentRepository.countByDoctorIdAndAppointmentDateAndStatusNotIn(
                request.getDoctorId(), appointmentDate, excludeStatuses);

        if (booked >= availability.getMaxAppointmentsPerSlot()) {
            throw new BadRequestException("Doctor has reached maximum appointments for this day (" + 
                availability.getMaxAppointmentsPerSlot() + ")");
        }

        String appointmentNumber = "APT-" + principal.getHospitalId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Appointment appointment = Appointment.builder()
                .appointmentNumber(appointmentNumber)
                .patientId(patient.getId())
                .doctorId(request.getDoctorId())
                .hospitalId(principal.getHospitalId())
                .appointmentDate(appointmentDate)
                .appointmentTime(appointmentTime)
                .reasonForVisit(request.getReasonForVisit())
                .status(AppointmentStatus.SCHEDULED)
                .notes(request.getNotes())
                .build();

        appointment = appointmentRepository.save(appointment);

        auditService.log("APPOINTMENT_CREATED", "APPOINTMENT", appointment.getId(),
                "Booked appointment for patient " + patient.getId() + " with doctor " + doctor.getName(), httpRequest);

        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse reschedule(UserPrincipal principal, Long id, RescheduleRequest request, HttpServletRequest httpRequest) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        validateHospitalAccess(principal, appointment);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot reschedule a " + appointment.getStatus().name().toLowerCase() + " appointment");
        }

        LocalDate newDate = LocalDate.parse(request.getAppointmentDate());
        LocalTime newTime = LocalTime.parse(request.getAppointmentTime());

        if (newDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot reschedule to a past date");
        }

        // Validate availability
        DoctorAvailability availability = availabilityRepository.findByDoctorIdAndDayOfWeek(appointment.getDoctorId(), newDate.getDayOfWeek())
                .orElseThrow(() -> new BadRequestException("Doctor is not available on " + newDate.getDayOfWeek()));

        if (!availability.getActive()) {
            throw new BadRequestException("Doctor is not available on " + newDate.getDayOfWeek());
        }

        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment = appointmentRepository.save(appointment);

        auditService.log("APPOINTMENT_RESCHEDULED", "APPOINTMENT", appointment.getId(),
                "Rescheduled to " + newDate + " " + newTime, httpRequest);

        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse cancel(UserPrincipal principal, Long id, HttpServletRequest httpRequest) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        validateHospitalAccess(principal, appointment);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.IN_CONSULTATION) {
            throw new BadRequestException("Cannot cancel an appointment that is " + appointment.getStatus().name().toLowerCase());
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);

        auditService.log("APPOINTMENT_CANCELLED", "APPOINTMENT", appointment.getId(),
                "Cancelled appointment " + appointment.getAppointmentNumber(), httpRequest);

        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse checkIn(UserPrincipal principal, Long id, HttpServletRequest httpRequest) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        validateHospitalAccess(principal, appointment);

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BadRequestException("Only scheduled or confirmed appointments can be checked in");
        }

        appointment.setStatus(AppointmentStatus.IN_QUEUE);
        appointment = appointmentRepository.save(appointment);

        // Create queue entry
        queueService.addToQueue(appointment, httpRequest);

        auditService.log("PATIENT_CHECKED_IN", "APPOINTMENT", appointment.getId(),
                "Patient checked in for appointment " + appointment.getAppointmentNumber(), httpRequest);

        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse get(UserPrincipal principal, Long id) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        validateAccess(principal, appointment);

        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> list(UserPrincipal principal, String date, String status, Pageable pageable) {
        Page<Appointment> appointments;

        if (date != null && !date.isBlank()) {
            LocalDate filterDate = LocalDate.parse(date);
            appointments = appointmentRepository.findByHospitalIdAndDate(principal.getHospitalId(), filterDate, pageable);
        } else if (status != null && !status.isBlank()) {
            AppointmentStatus filterStatus = AppointmentStatus.valueOf(status.toUpperCase());
            appointments = appointmentRepository.findByHospitalIdAndStatus(principal.getHospitalId(), filterStatus, pageable);
        } else {
            appointments = appointmentRepository.findByHospitalId(principal.getHospitalId(), pageable);
        }

        return appointments.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(UserPrincipal principal, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(principal.getId(), date)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getMyAppointments(UserPrincipal principal, Pageable pageable) {
        // Patient's user id → find the patient record
        Patient patient = patientRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient record not found"));

        return appointmentRepository.findByPatientId(patient.getId(), pageable)
                .map(this::mapToResponse);
    }

    private void validateHospitalAccess(UserPrincipal principal, Appointment appointment) {
        if (!principal.isSuperAdmin() && !appointment.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Appointment not found");
        }
    }

    private void validateAccess(UserPrincipal principal, Appointment appointment) {
        validateHospitalAccess(principal, appointment);
        if (principal.isDoctor() && !appointment.getDoctorId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        if (principal.isPatient()) {
            Patient patient = patientRepository.findByUserId(principal.getId()).orElse(null);
            if (patient == null || !appointment.getPatientId().equals(patient.getId())) {
                throw new ResourceNotFoundException("Appointment not found");
            }
        }
    }

    private AppointmentResponse mapToResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .appointmentNumber(a.getAppointmentNumber())
                .patientId(a.getPatientId())
                .patientName(a.getPatient() != null ? a.getPatient().getFirstName() + " " + a.getPatient().getLastName() : null)
                .doctorId(a.getDoctorId())
                .doctorName(a.getDoctor() != null ? a.getDoctor().getName() : null)
                .appointmentDate(a.getAppointmentDate().toString())
                .appointmentTime(a.getAppointmentTime().toString())
                .reasonForVisit(a.getReasonForVisit())
                .status(a.getStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .updatedAt(a.getUpdatedAt() != null ? a.getUpdatedAt().toString() : null)
                .build();
    }
}
