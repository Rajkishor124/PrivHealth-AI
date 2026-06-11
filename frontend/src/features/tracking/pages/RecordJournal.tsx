import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackingApi } from '@/api/trackingApi';
import { HealthJournalRequest } from '@/types/tracking';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecordJournal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HealthJournalRequest>({
    title: '',
    description: '',
    mood: 'Neutral'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }
    
    try {
      setLoading(true);
      await trackingApi.recordJournal(formData);
      toast.success('Journal entry saved');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to save journal');
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
            <FileText className="text-yellow-500" /> New Journal Entry
          </h1>
          <p className="text-slate-500 text-sm mt-1">Write about your daily health and well-being</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="e.g. Feeling much better today" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mood</label>
          <select name="mood" value={formData.mood} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all">
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Neutral">Neutral</option>
            <option value="Poor">Poor</option>
            <option value="Terrible">Terrible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Entry *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={6} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" placeholder="Write your thoughts..." />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
