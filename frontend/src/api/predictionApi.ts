import api from './axios';
import type { ApiResponse } from '@/types/api';
import type { Prediction, PredictionRequest, Explanation } from '@/types/prediction';

export const predictionApi = {
  create: (data: PredictionRequest) =>
    api.post<ApiResponse<Prediction>>('/predictions', data),

  list: (params: { page?: number; size?: number }) =>
    api.get<ApiResponse<Prediction[]>>('/predictions', { params }),

  get: (id: number) =>
    api.get<ApiResponse<Prediction>>(`/predictions/${id}`),

  getByPatient: (patientId: number) =>
    api.get<ApiResponse<Prediction[]>>(`/predictions/patient/${patientId}`),

  remove: (id: number) =>
    api.delete<ApiResponse<null>>(`/predictions/${id}`),

  getExplanation: (predictionId: number) =>
    api.get<ApiResponse<Explanation>>(`/explanations/${predictionId}`),
};
