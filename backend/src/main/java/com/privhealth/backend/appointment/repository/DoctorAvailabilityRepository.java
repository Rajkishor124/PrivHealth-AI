package com.privhealth.backend.appointment.repository;

import com.privhealth.backend.appointment.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    @Query("SELECT da FROM DoctorAvailability da LEFT JOIN FETCH da.doctor WHERE da.doctorId = :doctorId AND da.hospitalId = :hospitalId ORDER BY da.dayOfWeek")
    List<DoctorAvailability> findByDoctorIdAndHospitalId(Long doctorId, Long hospitalId);

    Optional<DoctorAvailability> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);

    @Query("SELECT da FROM DoctorAvailability da LEFT JOIN FETCH da.doctor WHERE da.hospitalId = :hospitalId AND da.active = :active ORDER BY da.doctor.name, da.dayOfWeek")
    List<DoctorAvailability> findByHospitalIdAndActive(Long hospitalId, boolean active);

    @Query("SELECT da FROM DoctorAvailability da LEFT JOIN FETCH da.doctor WHERE da.hospitalId = :hospitalId ORDER BY da.doctor.name, da.dayOfWeek")
    List<DoctorAvailability> findAllByHospitalId(Long hospitalId);
}
