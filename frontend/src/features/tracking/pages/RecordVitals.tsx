import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackingApi } from '@/api/trackingApi';
import { PatientVitalsRequest } from '@/types/tracking';
import { HeartPulse, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecordVitals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PatientVitalsRequest>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) {
      toast.error('Please enter at least one vital sign');
      return;
    }
    
    try {
      setLoading(true);
      await trackingApi.recordVitals(formData);
      toast.success('Vitals recorded successfully');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to record vitals');
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
            <HeartPulse className="text-rose-500" /> Record Vitals
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track your health measurements</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure (Systolic)</label>
            <input type="number" name="bloodPressureSystolic" value={formData.bloodPressureSystolic || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 120" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure (Diastolic)</label>
            <input type="number" name="bloodPressureDiastolic" value={formData.bloodPressureDiastolic || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 80" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Heart Rate (bpm)</label>
            <input type="number" name="heartRate" value={formData.heartRate || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 72" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Oxygen Saturation (%)</label>
            <input type="number" name="oxygenSaturation" value={formData.oxygenSaturation || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 98" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Temperature (°F/°C)</label>
            <input type="number" step="0.1" name="temperature" value={formData.temperature || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 98.6" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
            <input type="number" name="bloodSugar" value={formData.bloodSugar || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
            <input type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 70.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
            <input type="number" step="0.1" name="height" value={formData.height || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. 175" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Vitals'}
          </button>
        </div>
      </form>
    </div>
  );
}
