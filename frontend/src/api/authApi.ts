import api from './axios';
import type { ApiResponse } from '@/types/api';
import type { LoginRequest, RegisterRequest, LoginResponse, User, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth';

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<User>>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  me: () =>
    api.get<ApiResponse<User>>('/auth/me'),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse<null>>('/auth/reset-password', data),
};
