import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { createPrescription } from '@/api/emrApi';
import { fetchConsultationDetails } from '@/features/emr/emrSlice';
import { ArrowLeft, Loader2, Plus, Trash2, Pill } from 'lucide-react';
import type { PrescriptionRequest, PrescriptionMedicine } from '@/types/emr';

export default function PrescriptionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  const addMedicine = () => {
    setMedicines([...medicines, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length > 1) {
      const newMeds = [...medicines];
      newMeds.splice(index, 1);
      setMedicines(newMeds);
    }
  };

  const handleMedChange = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    const newMeds = [...medicines];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMedicines(newMeds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty medicines
    const validMedicines = medicines.filter(m => m.medicineName.trim() !== '');
    if (validMedicines.length === 0) {
      setError('Please add at least one medicine');
      return;
    }

    setLoading(true);
    setError('');
    
    const request: PrescriptionRequest = {
      consultationId: Number(id),
      prescriptionDate: new Date().toISOString().split('T')[0],
      notes,
      medicines: validMedicines
    };

    try {
      await createPrescription(request);
      dispatch(fetchConsultationDetails(Number(id)));
      navigate(`/consultations/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 flex items-center gap-2 mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Consultation
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Add Prescription</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Pill size={18} className="text-teal-600" />
                Medicines
              </h3>
              <button
                type="button"
                onClick={addMedicine}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <Plus size={16} /> Add Medicine
              </button>
            </div>

            {medicines.map((med, index) => (
              <div key={index} className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 relative group transition-all hover:shadow-sm">
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="absolute -top-2 -right-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 p-1.5 rounded-full shadow-sm transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Medicine Name</label>
                    <input
                      type="text"
                      required
                      value={med.medicineName}
                      onChange={(e) => handleMedChange(index, 'medicineName', e.target.value)}
                      placeholder="e.g. Amoxicillin 500mg"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                      placeholder="e.g. 1 Tablet"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                      placeholder="e.g. Twice a day"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                      placeholder="e.g. 7 Days"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Instructions</label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleMedChange(index, 'instructions', e.target.value)}
                      placeholder="e.g. Take after meals"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prescription Notes (Optional)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional advice or warnings..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
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
              Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
