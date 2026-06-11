import type { RiskCategory } from '@/types/patient';

export const riskColor = (category: RiskCategory | null | undefined): string => {
  switch (category) {
    case 'LOW': return 'text-emerald-600';
    case 'MODERATE': return 'text-amber-600';
    case 'HIGH': return 'text-red-600';
    default: return 'text-slate-400';
  }
};

export const riskBgColor = (category: RiskCategory | null | undefined): string => {
  switch (category) {
    case 'LOW': return 'bg-emerald-100 text-emerald-700';
    case 'MODERATE': return 'bg-amber-100 text-amber-700';
    case 'HIGH': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-500';
  }
};

export const riskChartColor = (category: RiskCategory | null | undefined): string => {
  switch (category) {
    case 'LOW': return '#059669';
    case 'MODERATE': return '#d97706';
    case 'HIGH': return '#dc2626';
    default: return '#94a3b8';
  }
};

export const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const humanizeFeature = (name: string): string => {
  const map: Record<string, string> = {
    age: 'Age',
    bloodPressure: 'Blood Pressure',
    cholesterol: 'Cholesterol',
    diabetes: 'Diabetes',
    bmi: 'BMI',
    heartRate: 'Heart Rate',
  };
  return map[name] ?? name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Math.round(value * 100)}%`;
};
