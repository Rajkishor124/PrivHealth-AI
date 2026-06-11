import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAnalytics } from '../adminSlice';
import Loader from '@/components/common/Loader';
import { Users, Stethoscope, Activity, Clock, TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { riskChartColor } from '@/utils/helpers';

export default function Analytics() {
  const dispatch = useAppDispatch();
  const { analytics } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (!analytics) return <Loader />;

  const statCards = [
    { icon: Users, label: 'Total Users', value: analytics.totalUsers, color: 'from-blue-500 to-indigo-600' },
    { icon: Stethoscope, label: 'Doctors', value: analytics.totalDoctors, color: 'from-teal-500 to-emerald-600' },
    { icon: Users, label: 'Receptionists', value: analytics.totalReceptionists, color: 'from-cyan-500 to-blue-600' },
    { icon: Users, label: 'Technicians', value: analytics.totalTechnicians, color: 'from-indigo-500 to-violet-600' },
    { icon: ShieldCheck, label: 'Active Staff', value: analytics.totalActiveStaff, color: 'from-emerald-500 to-green-600' },
    { icon: Users, label: 'Patients', value: analytics.totalPatients, color: 'from-purple-500 to-pink-600' },
    { icon: Activity, label: 'Predictions', value: analytics.totalPredictions, color: 'from-rose-500 to-red-600' },
    { icon: Stethoscope, label: 'Consultations', value: analytics.totalConsultations, color: 'from-blue-500 to-cyan-600' },
    { icon: Activity, label: 'Diagnoses', value: analytics.totalDiagnoses, color: 'from-purple-500 to-indigo-600' },
    { icon: Activity, label: 'Prescriptions', value: analytics.totalPrescriptions, color: 'from-emerald-500 to-teal-600' },
    { icon: Clock, label: 'Today Appointments', value: analytics.todayAppointments ?? 0, color: 'from-indigo-500 to-purple-600' },
    { icon: Activity, label: 'Tracking Symptoms', value: analytics.patientsTrackingSymptoms ?? 0, color: 'from-orange-500 to-red-600' },
    { icon: Activity, label: 'Tracking Vitals', value: analytics.patientsTrackingVitals ?? 0, color: 'from-rose-500 to-pink-600' },
    { icon: AlertCircle, label: 'Critical Alerts', value: analytics.activeCriticalAlerts ?? 0, color: 'from-red-500 to-red-700' },
  ];

  const maxDailyCount = Math.max(...analytics.predictionsLast30Days.map(d => d.count), 1);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Risk Distribution</h3>
          <div className="space-y-3">
            {(['LOW', 'MODERATE', 'HIGH'] as const).map((cat) => {
              const count = analytics.riskDistribution[cat] ?? 0;
              const total = Object.values(analytics.riskDistribution).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{cat}</span>
                    <span className="font-medium text-slate-900">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: riskChartColor(cat) }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictions over time — bar chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-500" /> Predictions (Last 30 Days)
          </h3>
          <div className="flex items-end gap-[3px] h-40">
            {analytics.predictionsLast30Days.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col justify-end group relative">
                <div
                  className="bg-teal-500 rounded-t-sm min-h-[2px] transition-all duration-300 hover:bg-teal-400"
                  style={{ height: `${(day.count / maxDailyCount) * 100}%` }}
                />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                  {day.date}: {day.count}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-slate-400">30 days ago</span>
            <span className="text-[10px] text-slate-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
