package com.privhealth.backend.appointment.repository;

import com.privhealth.backend.appointment.entity.Appointment;
import com.privhealth.backend.appointment.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor WHERE a.id = :id")
    Optional<Appointment> findByIdWithDetails(Long id);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor WHERE a.hospitalId = :hospitalId AND a.appointmentDate = :date ORDER BY a.appointmentTime")
    List<Appointment> findByHospitalIdAndAppointmentDate(Long hospitalId, LocalDate date);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor WHERE a.hospitalId = :hospitalId ORDER BY a.appointmentDate DESC, a.appointmentTime")
    Page<Appointment> findByHospitalId(Long hospitalId, Pageable pageable);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor WHERE a.hospitalId = :hospitalId AND a.status = :status ORDER BY a.appointmentDate DESC, a.appointmentTime")
    Page<Appointment> findByHospitalIdAndStatus(Long hospitalId, AppointmentStatus status, Pageable pageable);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor WHERE a.hospitalId = :hospitalId AND a.appointmentDate = :date ORDER BY a.appointmentTime")
    Page<Appointment> findByHospitalIdAndDate(Long hospitalId, LocalDate date, Pageable pageable);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor WHERE a.doctorId = :doctorId AND a.appointmentDate = :date ORDER BY a.appointmentTime")
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor WHERE a.patientId = :patientId ORDER BY a.appointmentDate DESC, a.appointmentTime DESC")
    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    long countByDoctorIdAndAppointmentDateAndStatusNotIn(Long doctorId, LocalDate date, List<AppointmentStatus> statuses);

    long countByHospitalIdAndAppointmentDate(Long hospitalId, LocalDate date);

    long countByHospitalIdAndAppointmentDateAndStatus(Long hospitalId, LocalDate date, AppointmentStatus status);

    long countByHospitalId(Long hospitalId);

    @Query("SELECT a.doctorId, a.doctor.name, COUNT(a), " +
           "SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status IN ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_QUEUE') THEN 1 ELSE 0 END) " +
           "FROM Appointment a WHERE a.hospitalId = :hospitalId AND a.appointmentDate = :date GROUP BY a.doctorId, a.doctor.name")
    List<Object[]> getDoctorUtilization(Long hospitalId, LocalDate date);
}
