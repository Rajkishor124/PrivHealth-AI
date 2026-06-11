import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { createDiagnosis } from '@/api/emrApi';
import { fetchConsultationDetails } from '@/features/emr/emrSlice';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import type { DiagnosisRequest, Severity } from '@/types/emr';

export default function DiagnosisForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<DiagnosisRequest>({
    consultationId: Number(id),
    diagnosisName: '',
    diagnosisCode: '',
    diagnosisDescription: '',
    severity: 'MODERATE',
    diagnosisDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createDiagnosis(formData);
      dispatch(fetchConsultationDetails(Number(id)));
      navigate(`/consultations/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add diagnosis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 flex items-center gap-2 mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Consultation
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Add Diagnosis</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Diagnosis Name</label>
              <input
                type="text"
                required
                value={formData.diagnosisName}
                onChange={(e) => setFormData({ ...formData, diagnosisName: e.target.value })}
                placeholder="e.g. Essential Hypertension"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Diagnosis Code (Optional)</label>
              <input
                type="text"
                value={formData.diagnosisCode}
                onChange={(e) => setFormData({ ...formData, diagnosisCode: e.target.value })}
                placeholder="e.g. I10"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as Severity })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MODERATE">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.diagnosisDescription}
              onChange={(e) => setFormData({ ...formData, diagnosisDescription: e.target.value })}
              placeholder="Provide more details about the diagnosis..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save Diagnosis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
