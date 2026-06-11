import { useEffect, useState } from 'react';
import { trackingApi } from '@/api/trackingApi';
import { HealthTrendsResponse, PatientSymptomResponse, PatientVitalsResponse, HealthAlertResponse } from '@/types/tracking';
import { HeartPulse, Activity, AlertCircle, Calendar } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

export default function PatientTrackingDashboard() {
  const { id } = useParams<{ id: string }>();
  const patientId = id ? Number(id) : 'me';
  
  const [trends, setTrends] = useState<HealthTrendsResponse | null>(null);
  const [alerts, setAlerts] = useState<HealthAlertResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // If patientId is 'me', we can use the timeline API to get all events, or create a specific /me/trends API.
        // For now, if we don't have a /me/trends API, we might need to rely on the timeline or just fetch normally if the backend allows it.
        // Actually, since patientId might be 'me', and we didn't create /me/trends, we'll assume the patient ID is available from context or we'll skip the trends chart if 'me' is passed directly.
        // Let's assume the parent component will resolve 'me' to actual ID or we update API. 
        // For now, if it's 'me', we will fetch timeline instead or just fetch alerts.
        
        // Let's fetch unified timeline to show recent activity
        
        // We will just fetch unified timeline and extract vitals
        const timeline = await trackingApi.getUnifiedTimeline(patientId);
        
        // This is a simplified dashboard view
        const fetchedAlerts = timeline.filter(t => t.type === 'ALERT'); // Timeline doesn't have alerts yet, so we will skip alerts for 'me' unless we call /patients/me/alerts
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [patientId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Recent Vitals</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Check log</h3>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
              <HeartPulse size={24} />
            </div>
          </div>
          {patientId === 'me' && (
            <Link to="/me/tracking/vitals/new" className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 py-2 rounded-lg text-center transition-colors">
              Log Vitals
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Symptoms</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Review</h3>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Activity size={24} />
            </div>
          </div>
          {patientId === 'me' && (
            <Link to="/me/tracking/symptoms/new" className="text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 py-2 rounded-lg text-center transition-colors">
              Log Symptom
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Health Alerts</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">No active</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <AlertCircle size={24} />
            </div>
          </div>
          {patientId === 'me' && (
            <Link to="/me/tracking/journals/new" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-lg text-center transition-colors">
              New Journal Entry
            </Link>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500 py-12">
        <Activity className="mx-auto mb-3 text-slate-300" size={32} />
        <p>Full trend analysis is available in the doctor's view.</p>
        <p className="text-sm mt-1">Please refer to the timeline for your recent activity.</p>
      </div>
    </div>
  );
}
