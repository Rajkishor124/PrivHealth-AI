export type ConsultationType = 'GENERAL' | 'FOLLOW_UP' | 'EMERGENCY' | 'SPECIALIST';
export type ConsultationStatus = 'OPEN' | 'COMPLETED' | 'CANCELLED';
export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ReportType = 'CONSULTATION' | 'DISCHARGE' | 'LAB' | 'FOLLOW_UP';

export interface Consultation {
  id: number;
  consultationNumber: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  consultationDate: string;
  consultationType: ConsultationType;
  chiefComplaint: string;
  consultationNotes: string;
  status: ConsultationStatus;
  createdAt: string;
}

export interface ConsultationRequest {
  patientId: number;
  consultationDate?: string;
  consultationType?: ConsultationType;
  chiefComplaint: string;
  consultationNotes?: string;
}

export interface Diagnosis {
  id: number;
  consultationId: number;
  consultationNumber: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  diagnosisCode?: string;
  diagnosisName: string;
  diagnosisDescription?: string;
  severity: Severity;
  diagnosisDate: string;
  createdAt: string;
}

export interface DiagnosisRequest {
  consultationId: number;
  diagnosisCode?: string;
  diagnosisName: string;
  diagnosisDescription?: string;
  severity: Severity;
  diagnosisDate?: string;
}

export interface PrescriptionMedicine {
  id?: number;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  consultationId: number;
  consultationNumber: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  prescriptionDate: string;
  notes?: string;
  medicines: PrescriptionMedicine[];
  createdAt: string;
}

export interface PrescriptionRequest {
  consultationId: number;
  prescriptionDate?: string;
  notes?: string;
  medicines: PrescriptionMedicine[];
}

export interface TreatmentNote {
  id: number;
  consultationId: number;
  consultationNumber: string;
  doctorId: number;
  doctorName: string;
  patientId: number;
  title: string;
  description?: string;
  createdAt: string;
}

export interface TreatmentNoteRequest {
  consultationId: number;
  title: string;
  description?: string;
}

export interface MedicalReport {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  reportTitle: string;
  reportType: ReportType;
  reportDate: string;
  summary?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface MedicalReportRequest {
  patientId: number;
  reportTitle: string;
  reportType?: ReportType;
  reportDate?: string;
  summary?: string;
  attachmentUrl?: string;
}

export interface MedicalTimelineItem {
  type: 'CONSULTATION' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'TREATMENT_NOTE' | 'REPORT';
  id: number;
  title: string;
  description?: string;
  doctorName: string;
  date: string;
}
