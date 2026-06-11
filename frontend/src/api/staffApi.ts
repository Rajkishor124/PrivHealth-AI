import api from './axios';
import type { ApiResponse, PageMeta } from '@/types/common';
import type { User } from '@/types/auth';

export const staffApi = {
  getStaff: (type: 'doctors' | 'receptionists' | 'technicians', page = 0, size = 20) =>
    api.get<ApiResponse<User[]>>(`/staff/${type}?page=${page}&size=${size}`),

  createStaff: (type: 'doctors' | 'receptionists' | 'technicians', data: any) =>
    api.post<ApiResponse<User>>(`/staff/${type}`, data),

  updateStaff: (type: 'doctors' | 'receptionists' | 'technicians', id: number, data: any) =>
    api.put<ApiResponse<User>>(`/staff/${type}/${id}`, data),

  deactivateStaff: (type: 'doctors' | 'receptionists' | 'technicians', id: number) =>
    api.delete<ApiResponse<User>>(`/staff/${type}/${id}`),
};
