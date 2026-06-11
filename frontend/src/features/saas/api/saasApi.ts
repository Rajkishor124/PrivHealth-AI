import api from '@/api/axios';
import { ApiResponse } from '@/types/api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  maxDoctors: number;
  maxPatients: number;
  maxStorageGB: number;
  maxPredictionsPerMonth: number;
  monthlyPrice: number;
  yearlyPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalSubscription {
  id: number;
  hospitalId: number;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  autoRenew: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
}

export interface TenantUsage {
  hospitalId: number;
  currentDoctors: number;
  currentPatients: number;
  currentStorageUsageGb: number;
  currentPredictions: number;
  currentAppointments: number;
  currentConsultations: number;
  billingCycleStart: string;
  billingCycleEnd: string;
  maxDoctors: number;
  maxPatients: number;
  maxStorageGB: number;
  maxPredictionsPerMonth: number;
}

export interface PlatformAnalytics {
  totalHospitals: number;
  totalActiveSubscriptions: number;
  totalDoctors: number;
  totalPatients: number;
  totalPredictionsThisMonth: number;
}

export interface OnboardHospitalRequest {
  name: string;
  address: string;
  contactNumber: string;
  adminEmail: string;
  adminPassword?: string;
  subscriptionPlanId: number;
}

export const saasApi = {
  getSubscriptionPlans: () => api.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans'),
  createSubscriptionPlan: (data: Partial<SubscriptionPlan>) => api.post<ApiResponse<SubscriptionPlan>>('/subscriptions/plans', data),
  updateSubscriptionPlan: (id: number, data: Partial<SubscriptionPlan>) => api.put<ApiResponse<SubscriptionPlan>>(`/subscriptions/plans/${id}`, data),
  onboardHospital: (data: OnboardHospitalRequest) => api.post<ApiResponse<any>>('/platform/onboard', data),
  getPlatformAnalytics: () => api.get<ApiResponse<PlatformAnalytics>>('/platform/analytics'),
  getMySubscription: () => api.get<ApiResponse<HospitalSubscription>>('/platform/my-subscription'),
  getMyUsage: () => api.get<ApiResponse<TenantUsage>>('/platform/my-usage'),
};
