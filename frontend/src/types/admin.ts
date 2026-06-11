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
  riskDistribution: Record<RiskCategory, number>;
  predictionsLast30Days: { date: string; count: number }[];
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
