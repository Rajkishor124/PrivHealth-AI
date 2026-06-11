import api from './axios';
import type { ApiResponse } from '@/types/api';
import type { Patient, PatientSummary, PatientRequest, PatientSelfUpdateRequest, AssignDoctorRequest } from '@/types/patient';

export const patientApi = {
  list: (params: { page?: number; size?: number; search?: string }) =>
    api.get<ApiResponse<PatientSummary[]>>('/patients', { params }),

  get: (id: number) =>
    api.get<ApiResponse<Patient>>(`/patients/${id}`),

  create: (data: PatientRequest) =>
    api.post<ApiResponse<Patient>>('/patients', data),

  update: (id: number, data: PatientRequest) =>
    api.put<ApiResponse<Patient>>(`/patients/${id}`, data),

  remove: (id: number) =>
    api.delete<ApiResponse<null>>(`/patients/${id}`),

  assignDoctor: (id: number, data: AssignDoctorRequest) =>
    api.post<ApiResponse<null>>(`/patients/${id}/assign-doctor`, data),

  getMyProfile: () =>
    api.get<ApiResponse<Patient>>('/patients/me'),

  updateMyProfile: (data: PatientSelfUpdateRequest) =>
    api.put<ApiResponse<Patient>>('/patients/me', data),
};
