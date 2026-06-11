import { useState, useEffect } from 'react';
import { saasApi, PlatformAnalytics } from '../api/saasApi';
import { Activity, Building, Users, ActivitySquare, Shield } from 'lucide-react';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

export default function PlatformDashboard() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    saasApi.getPlatformAnalytics()
      .then(res => setAnalytics(res.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="text-purple-600" /> Platform Overview
        </h1>
        <p className="text-slate-600">High-level metrics across all PrivHealth AI tenants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Hospitals</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Building size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{analytics?.totalHospitals || 0}</div>
            <p className="text-sm text-green-600 font-medium mt-1">Platform-wide</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Active Subscriptions</h3>
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <Activity size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{analytics?.totalActiveSubscriptions || 0}</div>
            <p className="text-sm text-green-600 font-medium mt-1">Generating revenue</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Patients</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{analytics?.totalPatients || 0}</div>
            <p className="text-sm text-slate-500 font-medium mt-1">Across all tenants</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">AI Predictions</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <ActivitySquare size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{analytics?.totalPredictionsThisMonth || 0}</div>
            <p className="text-sm text-slate-500 font-medium mt-1">Generated this month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
