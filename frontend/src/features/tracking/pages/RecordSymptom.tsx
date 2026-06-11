import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackingApi } from '@/api/trackingApi';
import { PatientSymptomRequest, SymptomMaster, SymptomSeverity } from '@/types/tracking';
import { Activity, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecordSymptom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [masterSymptoms, setMasterSymptoms] = useState<SymptomMaster[]>([]);
  const [formData, setFormData] = useState<PatientSymptomRequest>({
    symptomId: 0,
    severity: 'MILD',
    notes: ''
  });

  useEffect(() => {
    trackingApi.getActiveSymptoms().then(setMasterSymptoms).catch(() => toast.error('Failed to load symptoms catalog'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'symptomId' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symptomId) {
      toast.error('Please select a symptom');
      return;
    }
    
    try {
      setLoading(true);
      await trackingApi.recordSymptom(formData);
      toast.success('Symptom recorded successfully');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to record symptom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-orange-500" /> Log Symptom
          </h1>
          <p className="text-slate-500 text-sm mt-1">Keep track of how you're feeling</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Symptom *</label>
          <select name="symptomId" value={formData.symptomId} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all">
            <option value={0}>-- Select a symptom --</option>
            {masterSymptoms.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Severity *</label>
          <select name="severity" value={formData.severity} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all">
            <option value="MILD">Mild - Noticeable but doesn't interfere with daily activities</option>
            <option value="MODERATE">Moderate - Interferes somewhat with daily activities</option>
            <option value="SEVERE">Severe - Prevents daily activities</option>
            <option value="CRITICAL">Critical - Requires immediate medical attention</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="Describe how you're feeling, when it started, etc." />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" disabled={loading || !formData.symptomId} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Symptom'}
          </button>
        </div>
      </form>
    </div>
  );
}
