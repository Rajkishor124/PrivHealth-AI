import { useState, useEffect } from 'react';
import { saasApi, SubscriptionPlan } from '../api/saasApi';
import { Layers, Plus, Check } from 'lucide-react';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxDoctors: 5,
    maxPatients: 500,
    maxStorageGB: 10,
    maxPredictionsPerMonth: 1000,
    monthlyPrice: 0,
    yearlyPrice: 0,
    active: true
  });

  const fetchPlans = async () => {
    try {
      const res = await saasApi.getSubscriptionPlans();
      setPlans(res.data.data);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await saasApi.createSubscriptionPlan(formData);
      toast.success('Plan created successfully');
      setShowModal(false);
      fetchPlans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create plan');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-teal-600" /> Subscription Plans
          </h1>
          <p className="text-slate-600">Manage SaaS plans available for hospitals.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={18} /> New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-1 h-10">{plan.description}</p>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
                ${plan.monthlyPrice}
                <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex gap-3">
                  <Check className="text-teal-500 flex-shrink-0" size={20} />
                  <span className="text-slate-600">Up to {plan.maxDoctors} Doctors</span>
                </li>
                <li className="flex gap-3">
                  <Check className="text-teal-500 flex-shrink-0" size={20} />
                  <span className="text-slate-600">Up to {plan.maxPatients} Patients</span>
                </li>
                <li className="flex gap-3">
                  <Check className="text-teal-500 flex-shrink-0" size={20} />
                  <span className="text-slate-600">{plan.maxStorageGB} GB Storage</span>
                </li>
                <li className="flex gap-3">
                  <Check className="text-teal-500 flex-shrink-0" size={20} />
                  <span className="text-slate-600">{plan.maxPredictionsPerMonth} AI Predictions/mo</span>
                </li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
               <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {plan.active ? 'Active' : 'Inactive'}
               </span>
               <button className="text-sm text-teal-600 font-medium hover:text-teal-700">Edit Plan</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Create New Plan</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Price ($)</label>
                  <input required type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.monthlyPrice} onChange={e => setFormData({...formData, monthlyPrice: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Yearly Price ($)</label>
                  <input required type="number" step="0.01" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.yearlyPrice} onChange={e => setFormData({...formData, yearlyPrice: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Doctors</label>
                  <input required type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.maxDoctors} onChange={e => setFormData({...formData, maxDoctors: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Patients</label>
                  <input required type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.maxPatients} onChange={e => setFormData({...formData, maxPatients: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Storage (GB)</label>
                  <input required type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.maxStorageGB} onChange={e => setFormData({...formData, maxStorageGB: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">AI Predictions/mo</label>
                  <input required type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.maxPredictionsPerMonth} onChange={e => setFormData({...formData, maxPredictionsPerMonth: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                <button type="submit" disabled={isCreating} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                  {isCreating ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
