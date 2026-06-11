import { useState, useEffect } from 'react';
import { saasApi, SubscriptionPlan } from '../api/saasApi';
import { Building, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function HospitalOnboarding() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    saasApi.getSubscriptionPlans().then(res => setPlans(res.data.data)).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    adminEmail: '',
    adminPassword: '',
    subscriptionPlanId: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subscriptionPlanId) {
      toast.error('Please select a subscription plan');
      return;
    }
    setIsLoading(true);
    try {
      await saasApi.onboardHospital(formData);
      toast.success('Hospital onboarded successfully');
      navigate('/super-admin/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to onboard hospital');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building className="text-teal-600" /> Onboard New Hospital
        </h1>
        <p className="text-slate-600">Create a new hospital tenant and provision an admin account.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Hospital Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hospital Name</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Admin Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                <input required type="email" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Password</label>
                <input required type="password" minLength={8} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Subscription Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Plan</label>
              <select required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white" value={formData.subscriptionPlanId} onChange={e => setFormData({...formData, subscriptionPlanId: parseInt(e.target.value)})}>
                <option value={0} disabled>Select a plan...</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ${p.monthlyPrice}/mo</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 shadow-sm shadow-teal-200 disabled:opacity-70">
              <Send size={18} /> {isLoading ? 'Onboarding...' : 'Onboard Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
