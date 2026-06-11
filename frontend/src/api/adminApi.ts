import api from './axios';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/auth';
import type { Analytics, AuditLog } from '@/types/admin';

export const getUsers = (role?: string, page?: number, size?: number) =>
  api.get<ApiResponse<User[]>>('/admin/users', { params: { role, page, size } });

export const adminApi = {
  getPendingDoctors: () =>
    api.get<ApiResponse<User[]>>('/admin/doctors/pending'),

  approveDoctor: (id: number) =>
    api.put<ApiResponse<User>>(`/admin/doctors/${id}/approve`),

  rejectDoctor: (id: number) =>
    api.put<ApiResponse<User>>(`/admin/doctors/${id}/reject`),

  getUsers: (params: { role?: string; page?: number; size?: number }) =>
    getUsers(params.role, params.page, params.size),

  deleteUser: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/users/${id}`),

  getAnalytics: () =>
    api.get<ApiResponse<Analytics>>('/admin/analytics'),

  getAuditLogs: (params: { userId?: number; page?: number; size?: number }) =>
    api.get<ApiResponse<AuditLog[]>>('/admin/audit-logs', { params }),
};
