package com.privhealth.backend.appointment.service;

import com.privhealth.backend.appointment.dto.DoctorAvailabilityRequest;
import com.privhealth.backend.appointment.dto.DoctorAvailabilityResponse;
import com.privhealth.backend.appointment.entity.DoctorAvailability;
import com.privhealth.backend.appointment.repository.DoctorAvailabilityRepository;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.security.UserPrincipal;
import com.privhealth.backend.user.entity.Role;
import com.privhealth.backend.user.entity.User;
import com.privhealth.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    @Transactional
    public DoctorAvailabilityResponse setAvailability(UserPrincipal principal, DoctorAvailabilityRequest request) {
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctor.getRole() != Role.DOCTOR) {
            throw new BadRequestException("User is not a doctor");
        }

        if (!principal.isSuperAdmin() && !doctor.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Doctor not found in your hospital");
        }

        DayOfWeek dayOfWeek = DayOfWeek.valueOf(request.getDayOfWeek().toUpperCase());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());

        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }

        // Check if availability already exists for this doctor+day — update it
        DoctorAvailability availability = availabilityRepository
                .findByDoctorIdAndDayOfWeek(request.getDoctorId(), dayOfWeek)
                .orElse(DoctorAvailability.builder()
                        .doctorId(request.getDoctorId())
                        .hospitalId(doctor.getHospitalId())
                        .dayOfWeek(dayOfWeek)
                        .build());

        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setMaxAppointmentsPerSlot(request.getMaxAppointmentsPerSlot() != null ? request.getMaxAppointmentsPerSlot() : 20);
        availability.setActive(request.getActive() != null ? request.getActive() : true);

        availability = availabilityRepository.save(availability);

        return mapToResponse(availability);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityResponse> getByDoctor(UserPrincipal principal, Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!principal.isSuperAdmin() && !doctor.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Doctor not found in your hospital");
        }

        return availabilityRepository.findByDoctorIdAndHospitalId(doctorId, doctor.getHospitalId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityResponse> getByHospital(UserPrincipal principal) {
        return availabilityRepository.findAllByHospitalId(principal.getHospitalId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(UserPrincipal principal, Long id) {
        DoctorAvailability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability slot not found"));

        if (!principal.isSuperAdmin() && !availability.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Availability slot not found");
        }

        availabilityRepository.delete(availability);
    }

    private DoctorAvailabilityResponse mapToResponse(DoctorAvailability da) {
        return DoctorAvailabilityResponse.builder()
                .id(da.getId())
                .doctorId(da.getDoctorId())
                .doctorName(da.getDoctor() != null ? da.getDoctor().getName() : null)
                .dayOfWeek(da.getDayOfWeek().name())
                .startTime(da.getStartTime().toString())
                .endTime(da.getEndTime().toString())
                .maxAppointmentsPerSlot(da.getMaxAppointmentsPerSlot())
                .active(da.getActive())
                .build();
    }
}
