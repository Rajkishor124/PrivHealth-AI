import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPrediction, fetchExplanation, clearSelected } from '../predictionSlice';
import { RiskBadge } from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { formatDate, humanizeFeature, formatPercent } from '@/utils/helpers';

export default function PredictionDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: prediction, explanation } = useAppSelector((s) => s.predictions);

  useEffect(() => {
    if (id) {
      dispatch(fetchPrediction(Number(id)));
      dispatch(fetchExplanation(Number(id)));
    }
    return () => { dispatch(clearSelected()); };
  }, [id, dispatch]);

  if (!prediction) return <Loader />;

  const riskBg = prediction.riskCategory === 'HIGH' ? 'from-red-500 to-red-700'
    : prediction.riskCategory === 'MODERATE' ? 'from-amber-500 to-amber-700'
    : 'from-emerald-500 to-emerald-700';

  const contributions = explanation?.contributions ?? prediction.explanations ?? [];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Score header */}
        <div className={`bg-gradient-to-r ${riskBg} px-8 py-8 text-center`}>
          <p className="text-white/80 text-sm font-medium mb-2">Risk Assessment</p>
          <p className="text-5xl font-extrabold text-white mb-2">{Math.round(prediction.riskScore * 100)}%</p>
          <RiskBadge category={prediction.riskCategory} />
          <p className="text-white/70 text-sm mt-3">{prediction.patientName} • {formatDate(prediction.createdAt)}</p>
        </div>

        {/* Input snapshot */}
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Input Parameters</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'Age', value: prediction.input.age },
              { label: 'BP', value: `${prediction.input.bloodPressure}` },
              { label: 'Chol', value: prediction.input.cholesterol },
              { label: 'Diabetes', value: prediction.input.diabetes ? 'Yes' : 'No' },
              { label: 'BMI', value: prediction.input.bmi },
              { label: 'HR', value: prediction.input.heartRate },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 font-medium uppercase">{label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SHAP explanations */}
        {contributions.length > 0 && (
          <div className="p-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">SHAP Feature Contributions</h3>
            <div className="space-y-3">
              {contributions.map((exp) => {
                const maxAbs = Math.max(...contributions.map(e => Math.abs(e.contribution)));
                const width = maxAbs > 0 ? (Math.abs(exp.contribution) / maxAbs) * 100 : 0;
                const isPositive = exp.contribution >= 0;
                return (
                  <div key={exp.featureName} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-32 text-right shrink-0">{humanizeFeature(exp.featureName)}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-7 bg-slate-100 rounded-full overflow-hidden relative">
                        <div className={`absolute top-0 h-full rounded-full transition-all duration-700 ${isPositive ? 'bg-red-400 left-1/2' : 'bg-blue-400 right-1/2'}`}
                          style={{ width: `${width / 2}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-px h-full bg-slate-300" />
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-medium w-16 ${isPositive ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatPercent(exp.contribution)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
              <AlertTriangle size={12} /> Red = increases risk, Blue = decreases risk
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
