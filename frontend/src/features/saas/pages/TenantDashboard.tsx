import { useState, useEffect } from 'react';
import { saasApi, HospitalSubscription, TenantUsage } from '../api/saasApi';
import { CreditCard, Activity, Users, Database, Zap } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TenantDashboard() {
  const [sub, setSub] = useState<HospitalSubscription | null>(null);
  const [usage, setUsage] = useState<TenantUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      saasApi.getMySubscription(),
      saasApi.getMyUsage()
    ])
    .then(([subRes, usageRes]) => {
      setSub(subRes.data.data);
      setUsage(usageRes.data.data);
    })
    .catch(() => toast.error('Failed to load subscription data'))
    .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader />;

  if (!sub || !usage) {
    return <div className="p-6">Subscription data not found.</div>;
  }

  const renderProgress = (current: number, max: number, colorClass: string) => {
    const percentage = Math.min((current / max) * 100, 100);
    return (
      <div className="mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-slate-700">{current} / {max}</span>
          <span className="text-slate-500">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="text-teal-600" /> Subscription & Usage
        </h1>
        <p className="text-slate-600">Monitor your current plan limits and usage metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-inner">
                <CreditCard className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Current Plan</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {sub.status}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-extrabold text-slate-900">{sub.plan.name}</div>
              <p className="text-slate-500 mt-1">{sub.plan.description}</p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Valid From</span>
                <span className="text-slate-900 text-sm font-medium">{format(new Date(sub.startDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Renews On</span>
                <span className="text-slate-900 text-sm font-medium">{format(new Date(sub.endDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Auto Renew</span>
                <span className="text-slate-900 text-sm font-medium">{sub.autoRenew ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            Upgrade Plan
          </button>
        </div>

        {/* Usage Metrics Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-blue-500" size={18} />
              <h3 className="font-semibold text-slate-700">Medical Staff (Doctors)</h3>
            </div>
            {renderProgress(usage.currentDoctors, usage.maxDoctors, 'bg-blue-500')}
            <p className="text-xs text-slate-500 mt-2">Active doctors assigned to this tenant.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-purple-500" size={18} />
              <h3 className="font-semibold text-slate-700">Patients</h3>
            </div>
            {renderProgress(usage.currentPatients, usage.maxPatients, 'bg-purple-500')}
            <p className="text-xs text-slate-500 mt-2">Total registered patients.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Database className="text-teal-500" size={18} />
              <h3 className="font-semibold text-slate-700">Storage Usage (GB)</h3>
            </div>
            {renderProgress(usage.currentStorageUsageGb, usage.maxStorageGB, 'bg-teal-500')}
            <p className="text-xs text-slate-500 mt-2">Medical records and image storage.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-orange-500" size={18} />
              <h3 className="font-semibold text-slate-700">AI Predictions</h3>
            </div>
            {renderProgress(usage.currentPredictions, usage.maxPredictionsPerMonth, 'bg-orange-500')}
            <p className="text-xs text-slate-500 mt-2">Predictions used this billing cycle.</p>
            <p className="text-xs text-slate-400">Resets on {format(new Date(usage.billingCycleEnd), 'MMM dd')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
