import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';
import { getToken, clearToken } from '@/utils/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (auto-logout)
// Use a callback pattern to avoid importing store into axios (circular dep)
let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.error?.code;
      if (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID' || code === 'UNAUTHORIZED') {
        clearToken();
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  return 'Something went wrong';
};
