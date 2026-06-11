import api from './axios';
import type { ApiResponse, PaginatedData } from '@/types/api';
import type {
  Consultation, ConsultationRequest, ConsultationStatus,
  Diagnosis, DiagnosisRequest,
  Prescription, PrescriptionRequest,
  TreatmentNote, TreatmentNoteRequest,
  MedicalReport, MedicalReportRequest,
  MedicalTimelineItem
} from '@/types/emr';

// Consultations
export const createConsultation = (data: ConsultationRequest) => 
  api.post<ApiResponse<Consultation>>('/consultations', data);

export const getConsultations = (page = 0, size = 20, search?: string) => 
  api.get<ApiResponse<PaginatedData<Consultation>>>('/consultations', { params: { page, size, search } });

export const getConsultation = (id: number) => 
  api.get<ApiResponse<Consultation>>(`/consultations/${id}`);

export const updateConsultationStatus = (id: number, status: ConsultationStatus) => 
  api.put<ApiResponse<Consultation>>(`/consultations/${id}/status`, null, { params: { status } });

// Diagnoses
export const createDiagnosis = (data: DiagnosisRequest) => 
  api.post<ApiResponse<Diagnosis>>('/diagnoses', data);

export const getDiagnosesByConsultation = (consultationId: number) => 
  api.get<ApiResponse<Diagnosis[]>>(`/diagnoses/consultation/${consultationId}`);

// Prescriptions
export const createPrescription = (data: PrescriptionRequest) => 
  api.post<ApiResponse<Prescription>>('/prescriptions', data);

export const getPrescriptionsByConsultation = (consultationId: number) => 
  api.get<ApiResponse<Prescription[]>>(`/prescriptions/consultation/${consultationId}`);

export const getPrescription = (id: number) => 
  api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);

export const getPrescriptionsByPatient = (patientId: number, page = 0, size = 20) => 
  api.get<ApiResponse<PaginatedData<Prescription>>>(`/prescriptions/patient/${patientId}`, { params: { page, size } });

// Treatment Notes
export const createTreatmentNote = (data: TreatmentNoteRequest) => 
  api.post<ApiResponse<TreatmentNote>>('/treatment-notes', data);

export const getNotesByConsultation = (consultationId: number) => 
  api.get<ApiResponse<TreatmentNote[]>>(`/treatment-notes/consultation/${consultationId}`);

// Medical Reports
export const createMedicalReport = (data: MedicalReportRequest) => 
  api.post<ApiResponse<MedicalReport>>('/reports', data);

export const getMedicalReports = (patientId: number, page = 0, size = 20) => 
  api.get<ApiResponse<PaginatedData<MedicalReport>>>(`/reports/patient/${patientId}`, { params: { page, size } });

// Medical History Timeline
export const getMedicalHistory = (patientId: number) => 
  api.get<ApiResponse<MedicalTimelineItem[]>>(`/patients/${patientId}/medical-history`);

export const getMyMedicalHistory = () => 
  api.get<ApiResponse<MedicalTimelineItem[]>>('/patients/me/history');
