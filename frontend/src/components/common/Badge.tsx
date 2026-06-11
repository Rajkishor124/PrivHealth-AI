import type { RiskCategory } from '@/types/patient';
import type { StaffStatus } from '@/types/auth';
import { riskBgColor } from '@/utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function RiskBadge({ category }: { category: RiskCategory | null | undefined }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${riskBgColor(category)}`}>
      {category ?? '—'}
    </span>
  );
}

export function StatusBadge({ status }: { status: StaffStatus }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    INACTIVE: 'bg-slate-100 text-slate-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status ? styles[status] ?? '' : ''}`}>
      {status ?? '—'}
    </span>
  );
}
