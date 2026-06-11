import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPredictions } from '@/features/predictions/predictionSlice';
import { RiskBadge } from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';
import { Activity } from 'lucide-react';

export default function MyPredictions() {
  const dispatch = useAppDispatch();
  const { list, status } = useAppSelector((s) => s.predictions);

  useEffect(() => {
    dispatch(fetchPredictions({ page: 0, size: 50 }));
  }, [dispatch]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Predictions</h1>

      {status === 'loading' && <Loader />}

      {status !== 'loading' && list.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Activity size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No predictions available yet.</p>
          <p className="text-sm text-slate-400 mt-1">Your doctor will run predictions for you.</p>
        </div>
      )}

      {list.length > 0 && (
        <div className="grid gap-4">
          {list.map((p) => (
            <Link key={p.id} to={`/predictions/${p.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.patientName ?? 'Prediction'}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(p.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{Math.round(p.riskScore * 100)}%</span>
                  <RiskBadge category={p.riskCategory} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
