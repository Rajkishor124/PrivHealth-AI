import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPendingDoctors, approveDoctor, rejectDoctor } from '../adminSlice';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorApprovals() {
  const dispatch = useAppDispatch();
  const { pendingDoctors } = useAppSelector((s) => s.admin);
  const [loading, setLoading] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPendingDoctors());
  }, [dispatch]);

  const handleApprove = async (id: number) => {
    setLoading(id);
    const result = await dispatch(approveDoctor(id));
    if (approveDoctor.fulfilled.match(result)) toast.success('Doctor approved');
    else toast.error('Approval failed');
    setLoading(null);
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this doctor?')) return;
    setLoading(id);
    const result = await dispatch(rejectDoctor(id));
    if (rejectDoctor.fulfilled.match(result)) toast.success('Doctor rejected');
    else toast.error('Rejection failed');
    setLoading(null);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Doctor Approvals</h1>
      <p className="text-sm text-slate-500 mb-6">{pendingDoctors.length} pending</p>

      {pendingDoctors.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-slate-500">All caught up! No pending approvals.</p>
        </div>
      )}

      <div className="space-y-3">
        {pendingDoctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                {doc.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                <p className="text-xs text-slate-500">{doc.email} • Registered {formatDate(doc.createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleApprove(doc.id)} isLoading={loading === doc.id}>
                <CheckCircle size={14} /> Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleReject(doc.id)} isLoading={loading === doc.id}>
                <XCircle size={14} /> Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
