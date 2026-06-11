import api from './axios';
import {
  SymptomMaster,
  PatientSymptomRequest,
  PatientSymptomResponse,
  PatientVitalsRequest,
  PatientVitalsResponse,
  HealthJournalRequest,
  HealthJournalResponse,
  HealthAlertResponse,
  HealthTrendsResponse
} from '../types/tracking';

export const trackingApi = {
  getActiveSymptoms: async () => {
    const response = await api.get<SymptomMaster[]>('/tracking/symptoms/master');
    return response.data;
  },

  recordSymptom: async (data: PatientSymptomRequest) => {
    const response = await api.post<PatientSymptomResponse>('/tracking/symptoms', data);
    return response.data;
  },

  getPatientSymptoms: async (patientId: number) => {
    const response = await api.get<PatientSymptomResponse[]>(`/tracking/patients/${patientId}/symptoms`);
    return response.data;
  },

  recordVitals: async (data: PatientVitalsRequest) => {
    const response = await api.post<PatientVitalsResponse>('/tracking/vitals', data);
    return response.data;
  },

  getPatientVitals: async (patientId: number) => {
    const response = await api.get<PatientVitalsResponse[]>(`/tracking/patients/${patientId}/vitals`);
    return response.data;
  },

  recordJournal: async (data: HealthJournalRequest) => {
    const response = await api.post<HealthJournalResponse>('/tracking/journals', data);
    return response.data;
  },

  getPatientJournals: async (patientId: number) => {
    const response = await api.get<HealthJournalResponse[]>(`/tracking/patients/${patientId}/journals`);
    return response.data;
  },

  getPatientAlerts: async (patientId: number) => {
    const response = await api.get<HealthAlertResponse[]>(`/tracking/patients/${patientId}/alerts`);
    return response.data;
  },

  getHospitalAlerts: async () => {
    const response = await api.get<HealthAlertResponse[]>('/tracking/hospital/alerts');
    return response.data;
  },

  getHealthTrends: async (patientId: number) => {
    const response = await api.get<HealthTrendsResponse>(`/tracking/patients/${patientId}/trends`);
    return response.data;
  },

  getUnifiedTimeline: async (patientId: number | 'me') => {
    const url = patientId === 'me' ? '/tracking/patients/me/timeline' : `/tracking/patients/${patientId}/timeline`;
    const response = await api.get<any[]>(url);
    return response.data;
  }
};
