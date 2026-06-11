export type Role = 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'TECHNICIAN' | 'PATIENT';
export type StaffStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | null;

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  staffStatus: StaffStatus;
  employeeId?: string;
  specialization?: string;
  qualification?: string;
  yearsOfExperience?: number;
  medicalLicenseNumber?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  hospitalId?: number;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  hospitalCode: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
