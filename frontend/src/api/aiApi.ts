import api from './axios';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { RiskAssessmentResponse, RiskAlertResponse, GeneratePredictionRequest } from '../types/ai';

export const aiApi = {
    generatePredictions: async (request: GeneratePredictionRequest) => {
        const response = await api.post<ApiResponse<RiskAssessmentResponse[]>>('/ai/predictions/generate', request);
        return response.data;
    },
    
    getPatientPredictions: async (patientId: number, page = 0, size = 20) => {
        const response = await api.get<PaginatedResponse<RiskAssessmentResponse[]>>(`/ai/predictions/patient/${patientId}`, {
            params: { page, size }
        });
        return response.data;
    },
    
    getRiskAlerts: async (page = 0, size = 20) => {
        const response = await api.get<PaginatedResponse<RiskAlertResponse[]>>('/ai/risk-alerts', {
            params: { page, size }
        });
        return response.data;
    }
};
