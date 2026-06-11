import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPredictions } from '../predictionSlice';
import { RiskBadge } from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PredictionHistory() {
  const dispatch = useAppDispatch();
  const { list, meta, status } = useAppSelector((s) => s.predictions);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(fetchPredictions({ page, size: 15 }));
  }, [dispatch, page]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Prediction History</h1>
        <p className="text-sm text-slate-500 mt-1">{meta?.totalElements ?? 0} total predictions</p>
      </div>

      {status === 'loading' && <Loader />}

      {status !== 'loading' && list.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Activity size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No predictions yet</p>
        </div>
      )}

      {list.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Score</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.patientName ?? `Patient #${p.patientId}`}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          p.riskScore > 0.66 ? 'bg-red-500' : p.riskScore > 0.33 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} style={{ width: `${p.riskScore * 100}%` }} />
                      </div>
                      <span className="text-sm font-mono text-slate-600">{Math.round(p.riskScore * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><RiskBadge category={p.riskCategory} /></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(p.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/predictions/${p.id}`} className="text-sm text-teal-600 font-medium hover:text-teal-700">Details →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">Page {meta.page + 1} of {meta.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages - 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
