package com.privhealth.backend.emr.service;

import com.privhealth.backend.audit.service.AuditService;
import com.privhealth.backend.common.exception.BadRequestException;
import com.privhealth.backend.common.exception.ResourceNotFoundException;
import com.privhealth.backend.emr.dto.MedicalReportRequest;
import com.privhealth.backend.emr.dto.MedicalReportResponse;
import com.privhealth.backend.emr.entity.MedicalReport;
import com.privhealth.backend.emr.entity.ReportType;
import com.privhealth.backend.emr.repository.MedicalReportRepository;
import com.privhealth.backend.patient.entity.Patient;
import com.privhealth.backend.patient.repository.PatientRepository;
import com.privhealth.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class MedicalReportService {

    private final MedicalReportRepository medicalReportRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    @Transactional
    public MedicalReportResponse create(UserPrincipal principal, MedicalReportRequest request, HttpServletRequest httpRequest) {
        Patient patient = patientRepository.findByIdWithDoctor(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!patient.getHospitalId().equals(principal.getHospitalId())) {
            throw new ResourceNotFoundException("Patient not found in your hospital");
        }

        if (principal.isDoctor() && !principal.getId().equals(patient.getDoctorId())) {
            throw new BadRequestException("You can only create reports for your assigned patients");
        }

        Long doctorId = principal.isDoctor() ? principal.getId() : patient.getDoctorId();
        if (doctorId == null) {
            throw new BadRequestException("Patient must have an assigned doctor to create a report");
        }

        MedicalReport report = MedicalReport.builder()
                .patientId(patient.getId())
                .doctorId(doctorId)
                .hospitalId(principal.getHospitalId())
                .reportTitle(request.getReportTitle())
                .reportType(request.getReportType() != null ? request.getReportType() : ReportType.CONSULTATION)
                .reportDate(request.getReportDate() != null ? request.getReportDate() : LocalDate.now())
                .summary(request.getSummary())
                .attachmentUrl(request.getAttachmentUrl())
                .build();

        report = medicalReportRepository.save(report);

        auditService.log("MEDICAL_REPORT_CREATED", "MEDICAL_REPORT", report.getId(),
                "Created report for patient " + patient.getId(), httpRequest);

        return mapToResponse(report, patient);
    }

    @Transactional(readOnly = true)
    public MedicalReportResponse get(UserPrincipal principal, Long id) {
        MedicalReport report = medicalReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        validateAccess(principal, report);
        
        Patient patient = patientRepository.findByIdWithDoctor(report.getPatientId()).orElse(null);

        return mapToResponse(report, patient);
    }

    @Transactional(readOnly = true)
    public Page<MedicalReportResponse> listByPatient(UserPrincipal principal, Long patientId, Pageable pageable) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!patient.getHospitalId().equals(principal.getHospitalId()) && !principal.isSuperAdmin()) {
            throw new ResourceNotFoundException("Patient not found");
        }
        if (principal.isDoctor() && !patient.getDoctorId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Patient not found");
        }
        if (principal.isPatient() && !patient.getUserId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Patient not found");
        }

        return medicalReportRepository.findByPatientId(patientId, pageable)
                .map(r -> mapToResponse(r, patient));
    }

    private void validateAccess(UserPrincipal principal, MedicalReport report) {
        if (!report.getHospitalId().equals(principal.getHospitalId()) && !principal.isSuperAdmin()) {
            throw new ResourceNotFoundException("Report not found");
        }
        if (principal.isDoctor() && !report.getDoctorId().equals(principal.getId())) {
            throw new ResourceNotFoundException("Report not found");
        }
        Patient patient = patientRepository.findById(report.getPatientId()).orElse(null);
        if (principal.isPatient() && (patient == null || !patient.getUserId().equals(principal.getId()))) {
            throw new ResourceNotFoundException("Report not found");
        }
    }

    private MedicalReportResponse mapToResponse(MedicalReport r, Patient patient) {
        return MedicalReportResponse.builder()
                .id(r.getId())
                .patientId(r.getPatientId())
                .patientName(patient != null ? patient.getFirstName() + " " + patient.getLastName() : null)
                .doctorId(r.getDoctorId())
                .doctorName(patient != null && patient.getDoctor() != null ? patient.getDoctor().getName() : null)
                .reportTitle(r.getReportTitle())
                .reportType(r.getReportType())
                .reportDate(r.getReportDate() != null ? r.getReportDate().toString() : null)
                .summary(r.getSummary())
                .attachmentUrl(r.getAttachmentUrl())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .build();
    }
}
