import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { createTreatmentNote } from '@/api/emrApi';
import { fetchConsultationDetails } from '@/features/emr/emrSlice';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import type { TreatmentNoteRequest } from '@/types/emr';

export default function TreatmentNoteForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<TreatmentNoteRequest>({
    consultationId: Number(id),
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createTreatmentNote(formData);
      dispatch(fetchConsultationDetails(Number(id)));
      navigate(`/consultations/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add treatment note');
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
        <h1 className="text-2xl font-bold text-slate-900">Add Treatment Note</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Note Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Lab Results Review, Procedure Update"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Note Description</label>
            <textarea
              required
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed treatment notes..."
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
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
