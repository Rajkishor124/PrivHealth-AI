export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type PatientStatus = 'ACTIVE' | 'INACTIVE';
export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH';

export interface Patient {
  id: number;
  doctorId?: number | null;
  doctorName?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: string;
  profilePhoto?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: PatientStatus;
  height?: number;
  weight?: number;
  allergies?: string;
  existingConditions?: string;
  temporaryPassword?: string;
  createdAt: string;
}

export interface PatientSummary {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone?: string;
  status: PatientStatus;
  createdAt: string;
  lastRiskCategory?: RiskCategory | null;
}

export interface PatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: string;
  phone?: string;
  email: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  doctorId?: number | null;
  height?: number;
  weight?: number;
  allergies?: string;
  existingConditions?: string;
}

export interface PatientSelfUpdateRequest {
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface AssignDoctorRequest {
  doctorId: number;
}
