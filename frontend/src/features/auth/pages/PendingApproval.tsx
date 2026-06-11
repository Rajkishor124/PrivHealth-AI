import { Clock, Shield } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';

export default function PendingApproval() {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
        <Clock size={36} className="text-amber-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Pending Approval</h2>
      <p className="text-slate-500 max-w-md mb-4">
        Hi <strong>{user?.name}</strong>, your doctor account is awaiting admin approval.
        You'll be able to access the platform once approved.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
        <Clock size={14} /> Status: {user?.staffStatus}
      </div>
    </div>
  );
}
