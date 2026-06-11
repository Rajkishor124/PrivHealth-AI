package com.privhealth.backend.appointment.repository;

import com.privhealth.backend.appointment.entity.PatientQueue;
import com.privhealth.backend.appointment.entity.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientQueueRepository extends JpaRepository<PatientQueue, Long> {

    @Query("SELECT pq FROM PatientQueue pq LEFT JOIN FETCH pq.patient LEFT JOIN FETCH pq.appointment " +
           "WHERE pq.doctorId = :doctorId AND pq.checkInTime >= :startOfDay AND pq.checkInTime < :endOfDay " +
           "ORDER BY pq.queuePosition")
    List<PatientQueue> findByDoctorIdAndDate(Long doctorId, Instant startOfDay, Instant endOfDay);

    @Query("SELECT pq FROM PatientQueue pq LEFT JOIN FETCH pq.patient LEFT JOIN FETCH pq.appointment LEFT JOIN FETCH pq.doctor " +
           "WHERE pq.hospitalId = :hospitalId AND pq.checkInTime >= :startOfDay AND pq.checkInTime < :endOfDay " +
           "ORDER BY pq.doctorId, pq.queuePosition")
    List<PatientQueue> findByHospitalIdAndDate(Long hospitalId, Instant startOfDay, Instant endOfDay);

    @Query("SELECT pq FROM PatientQueue pq LEFT JOIN FETCH pq.patient LEFT JOIN FETCH pq.appointment " +
           "WHERE pq.doctorId = :doctorId AND pq.status = :status " +
           "AND pq.checkInTime >= :startOfDay AND pq.checkInTime < :endOfDay " +
           "ORDER BY pq.queuePosition ASC")
    List<PatientQueue> findByDoctorIdAndStatusAndDate(Long doctorId, QueueStatus status, Instant startOfDay, Instant endOfDay);

    Optional<PatientQueue> findFirstByDoctorIdAndStatusOrderByQueuePositionAsc(Long doctorId, QueueStatus status);

    @Query("SELECT COALESCE(MAX(pq.queuePosition), 0) FROM PatientQueue pq " +
           "WHERE pq.doctorId = :doctorId AND pq.checkInTime >= :startOfDay AND pq.checkInTime < :endOfDay")
    int findMaxQueuePositionByDoctorIdAndDate(Long doctorId, Instant startOfDay, Instant endOfDay);

    @Query("SELECT COUNT(pq) FROM PatientQueue pq " +
           "WHERE pq.doctorId = :doctorId AND pq.status = :status " +
           "AND pq.checkInTime >= :startOfDay AND pq.checkInTime < :endOfDay")
    long countByDoctorIdAndStatusAndDate(Long doctorId, QueueStatus status, Instant startOfDay, Instant endOfDay);

    @Query("SELECT COUNT(pq) FROM PatientQueue pq " +
           "WHERE pq.hospitalId = :hospitalId AND pq.status = :status " +
           "AND pq.checkInTime >= :startOfDay AND pq.checkInTime < :endOfDay")
    long countByHospitalIdAndStatusAndDate(Long hospitalId, QueueStatus status, Instant startOfDay, Instant endOfDay);

    @Query("SELECT pq FROM PatientQueue pq LEFT JOIN FETCH pq.patient LEFT JOIN FETCH pq.appointment " +
           "WHERE pq.id = :id")
    Optional<PatientQueue> findByIdWithDetails(Long id);
}
