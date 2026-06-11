import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createConsultation } from '@/api/emrApi';
import { fetchPatients } from '@/features/patients/patientSlice';
import { Stethoscope, Calendar, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import type { ConsultationRequest, ConsultationType } from '@/types/emr';

export default function ConsultationForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { patients } = useAppSelector((state) => state.patients);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pre-select patient if navigating from patient list
  const preselectedPatientId = new URLSearchParams(location.search).get('patientId');

  const [formData, setFormData] = useState<ConsultationRequest>({
    patientId: preselectedPatientId ? Number(preselectedPatientId) : 0,
    consultationDate: new Date().toISOString().split('T')[0],
    consultationType: 'GENERAL',
    chiefComplaint: '',
    consultationNotes: '',
  });

  useEffect(() => {
    dispatch(fetchPatients({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await createConsultation(formData);
      navigate(`/consultations/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 flex items-center gap-2 mb-4 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">New Consultation</h1>
        <p className="text-sm text-slate-500 mt-1">Start a new visit record for a patient</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Patient</label>
              <select
                required
                value={formData.patientId || ''}
                onChange={(e) => setFormData({ ...formData, patientId: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              >
                <option value="" disabled>Select a patient</option>
                {patients?.content.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Type</label>
              <select
                required
                value={formData.consultationType}
                onChange={(e) => setFormData({ ...formData, consultationType: e.target.value as ConsultationType })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              >
                <option value="GENERAL">General</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="SPECIALIST">Specialist</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  required
                  value={formData.consultationDate}
                  onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Chief Complaint</label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-3 text-slate-400" size={18} />
              <textarea
                required
                rows={3}
                placeholder="What brings the patient in today?"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Clinical Notes (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
              <textarea
                rows={5}
                placeholder="Initial observations..."
                value={formData.consultationNotes}
                onChange={(e) => setFormData({ ...formData, consultationNotes: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
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
              Create Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
