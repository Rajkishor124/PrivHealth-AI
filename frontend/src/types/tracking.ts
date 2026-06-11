export type SymptomCategory = 'GENERAL' | 'CARDIAC' | 'RESPIRATORY' | 'DIABETES' | 'NEUROLOGICAL' | 'OTHER';
export type SymptomSeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SymptomMaster {
  id: number;
  name: string;
  category: SymptomCategory;
  description: string;
}

export interface PatientSymptomRequest {
  patientId?: number;
  symptomId: number;
  severity: SymptomSeverity;
  notes?: string;
}

export interface PatientSymptomResponse {
  id: number;
  patientId: number;
  symptomId: number;
  symptomName: string;
  category: SymptomCategory;
  severity: SymptomSeverity;
  notes?: string;
  recordedAt: string;
}

export interface PatientVitalsRequest {
  patientId?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  temperature?: number;
  bloodSugar?: number;
  weight?: number;
  height?: number;
}

export interface PatientVitalsResponse {
  id: number;
  patientId: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  temperature?: number;
  bloodSugar?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedAt: string;
}

export interface HealthJournalRequest {
  patientId?: number;
  title: string;
  description: string;
  mood?: string;
}

export interface HealthJournalResponse {
  id: number;
  patientId: number;
  title: string;
  description: string;
  mood?: string;
  createdAt: string;
}

export interface HealthAlertResponse {
  id: number;
  patientId: number;
  patientName: string;
  alertType: string;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
}

export interface HealthTrendsResponse {
  vitalsHistory: PatientVitalsResponse[];
  symptomFrequencies: Record<string, number>;
}
