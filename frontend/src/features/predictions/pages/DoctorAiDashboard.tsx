import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchRiskAlerts, fetchPatientPredictions } from '../aiSlice';
import Loader from '@/components/common/Loader';
import { AlertCircle, Activity, ChevronRight, ActivitySquare, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorAiDashboard() {
  const dispatch = useAppDispatch();
  const { alerts, status } = useAppSelector((state) => state.ai);

  useEffect(() => {
    dispatch(fetchRiskAlerts({ size: 50 }));
  }, [dispatch]);

  if (status === 'loading' && alerts.length === 0) return <Loader />;

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const highAlerts = alerts.filter(a => a.severity === 'HIGH');

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clinical AI Dashboard</h1>
          <p className="text-slate-500 mt-2">Active alerts and high-risk patients requiring immediate review.</p>
        </div>
        <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200">
          Note: AI insights do not replace clinical judgment.
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert size={80} className="text-red-600" />
          </div>
          <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">Critical Alerts</p>
          <p className="text-4xl font-bold text-slate-900">{criticalAlerts.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle size={80} className="text-orange-600" />
          </div>
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">High Risk Alerts</p>
          <p className="text-4xl font-bold text-slate-900">{highAlerts.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ActivitySquare size={80} className="text-teal-600" />
          </div>
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-2">Total Monitored</p>
          <p className="text-4xl font-bold text-slate-900">--</p>
          <p className="text-xs text-slate-500 mt-2">View Population Analytics</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="text-red-500" /> Action Required: Active Risk Alerts
          </h2>
        </div>
        
        {alerts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">No active alerts at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                      alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{alert.alertType.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-slate-500">{new Date(alert.generatedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700 max-w-2xl">{alert.message}</p>
                </div>
                <div>
                  <Link 
                    to={`/dashboard/patients/${alert.patientId}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                    View Patient <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
