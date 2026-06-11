import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createPrediction } from '../predictionSlice';
import { fetchPatient, clearSelected } from '@/features/patients/patientSlice';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import { RiskBadge } from '@/components/common/Badge';
import { ArrowLeft, Activity, AlertTriangle } from 'lucide-react';
import { humanizeFeature, formatPercent } from '@/utils/helpers';
import toast from 'react-hot-toast';
import type { Prediction } from '@/types/prediction';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PredictionForm() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: patient } = useAppSelector((s) => s.patients);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);

  const [form, setForm] = useState({
    age: '', bloodPressure: '120', cholesterol: '200',
    diabetes: false, bmi: '25.0', heartRate: '75',
  });

  useEffect(() => {
    if (id) dispatch(fetchPatient(Number(id)));
    return () => { dispatch(clearSelected()); };
  }, [id, dispatch]);

  useEffect(() => {
    if (patient) setForm(f => ({ ...f, age: String(calculateAge(patient.dateOfBirth)) }));
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await dispatch(createPrediction({
      patientId: Number(id),
      age: Number(form.age),
      bloodPressure: Number(form.bloodPressure),
      cholesterol: Number(form.cholesterol),
      diabetes: form.diabetes,
      bmi: Number(form.bmi),
      heartRate: Number(form.heartRate),
    }));
    if (createPrediction.fulfilled.match(res)) {
      setResult(res.payload);
      toast.success('Prediction completed!');
    } else {
      toast.error((res.payload as string) || 'Prediction failed');
    }
    setLoading(false);
  };

  if (!patient) return <Loader />;

  // Result view
  if (result) {
    const riskBg = result.riskCategory === 'HIGH' ? 'from-red-500 to-red-700'
      : result.riskCategory === 'MODERATE' ? 'from-amber-500 to-amber-700'
      : 'from-emerald-500 to-emerald-700';

    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${riskBg} px-8 py-8 text-center`}>
            <p className="text-white/80 text-sm font-medium mb-2">Risk Assessment Result</p>
            <p className="text-5xl font-extrabold text-white mb-2">{Math.round(result.riskScore * 100)}%</p>
            <RiskBadge category={result.riskCategory} />
            <p className="text-white/70 text-sm mt-3">Patient: {patient.firstName} {patient.lastName}</p>
          </div>

          {/* SHAP explanations */}
          {result.explanations && result.explanations.length > 0 && (
            <div className="p-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Feature Contributions (SHAP)</h3>
              <div className="space-y-3">
                {result.explanations.map((exp) => {
                  const maxAbs = Math.max(...result.explanations!.map(e => Math.abs(e.contribution)));
                  const width = maxAbs > 0 ? (Math.abs(exp.contribution) / maxAbs) * 100 : 0;
                  const isPositive = exp.contribution >= 0;

                  return (
                    <div key={exp.featureName} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 w-32 text-right shrink-0">{humanizeFeature(exp.featureName)}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
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
                <AlertTriangle size={12} /> Red bars increase risk, blue bars decrease risk
              </p>
            </div>
          )}

          <div className="px-8 pb-8 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate(`/patients/${id}`)}>Back to Patient</Button>
            <Button onClick={() => navigate(`/predictions/${result.id}`)}>View Full Report</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <Activity size={20} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Run Risk Prediction</h1>
            <p className="text-sm text-slate-500">Patient: {patient.firstName} {patient.lastName} ({calculateAge(patient.dateOfBirth)}y, {patient.gender})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Input label="Age" type="number" required min={0} max={120}
              value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <Input label="Blood Pressure (mmHg)" type="number" required min={60} max={250}
              value={form.bloodPressure} onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })} />
            <Input label="Cholesterol (mg/dL)" type="number" required min={80} max={500}
              value={form.cholesterol} onChange={(e) => setForm({ ...form, cholesterol: e.target.value })} />
            <Input label="BMI" type="number" required min={10} max={60} step="0.1"
              value={form.bmi} onChange={(e) => setForm({ ...form, bmi: e.target.value })} />
            <Input label="Heart Rate (bpm)" type="number" required min={30} max={220}
              value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} />
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 w-full">
                <input type="checkbox" checked={form.diabetes}
                  onChange={(e) => setForm({ ...form, diabetes: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                <span className="text-sm text-slate-700">Diabetes</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>
              <Activity size={16} /> Run Prediction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
