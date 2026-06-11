import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPredictions } from '@/features/predictions/predictionSlice';
import { RiskBadge } from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import { formatDate, humanizeFeature, formatPercent } from '@/utils/helpers';
import { FileText, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RiskReports() {
  const dispatch = useAppDispatch();
  const { list, status } = useAppSelector((s) => s.predictions);

  useEffect(() => {
    dispatch(fetchPredictions({ page: 0, size: 50 }));
  }, [dispatch]);

  if (status === 'loading') return <Loader />;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Risk Reports</h1>

      {list.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <FileText size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No reports available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {list.slice(0, 5).map((p) => (
            <Link key={p.id} to={`/predictions/${p.id}`}
              className="block bg-white rounded-2xl border border-slate-200 p-6 hover:border-teal-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Report #{p.id}</p>
                  <p className="text-xs text-slate-500">{formatDate(p.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-900">{Math.round(p.riskScore * 100)}%</span>
                  <RiskBadge category={p.riskCategory} />
                </div>
              </div>
              {p.explanations && p.explanations.length > 0 && (
                <div className="space-y-2">
                  {p.explanations.slice(0, 3).map((exp) => (
                    <div key={exp.featureName} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{humanizeFeature(exp.featureName)}</span>
                      <span className={`font-mono text-xs ${exp.contribution >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatPercent(exp.contribution)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
