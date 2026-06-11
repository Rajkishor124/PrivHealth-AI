import type { RiskCategory } from './patient';
import type { User } from './auth';

export interface Analytics {
  totalUsers: number;
  totalDoctors: number;
  pendingDoctors: number;
  totalPatients: number;
  totalPredictions: number;
  totalReceptionists: number;
  totalTechnicians: number;
  totalActiveStaff: number;
  totalConsultations: number;
  totalDiagnoses: number;
  totalPrescriptions: number;
  totalAppointments?: number;
  todayAppointments?: number;
  todayCheckedIn?: number;
  todayWaiting?: number;
  todayCompleted?: number;
  patientsTrackingSymptoms?: number;
  patientsTrackingVitals?: number;
  patientsJournaling?: number;
  activeCriticalAlerts?: number;
  avgSystolic?: number | null;
  avgDiastolic?: number | null;
  avgBloodSugar?: number | null;
  riskDistribution: Record<RiskCategory, number>;
  predictionsLast30Days: { date: string; count: number }[];
  highRiskPatients?: number;
  mostCommonRiskFactors?: Record<string, number>;
}

export interface AuditLog {
  id: number;
  userId: number | null;
  userName: string | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export type { User };
