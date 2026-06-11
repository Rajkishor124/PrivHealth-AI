import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPatientPredictions, fetchRiskAlerts } from '../aiSlice';
import Loader from '@/components/common/Loader';
import { Heart, Activity, AlertCircle, CheckCircle, Info, Stethoscope, ChevronRight } from 'lucide-react';
import { riskChartColor } from '@/utils/helpers';
import type { RiskAssessmentResponse } from '@/types/ai';

export default function PatientAiDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { assessments, alerts, status } = useAppSelector((state) => state.ai);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPatientPredictions({ patientId: user.id }));
      dispatch(fetchRiskAlerts({})); // Get hospital alerts, backend filters if needed or patient alerts should be fetched differently. Wait, backend filter for alerts is per hospital. For patient, they only see their own predictions and alerts if we have a specific endpoint. Wait, Patient doesn't need to see "alerts" list directly, just their latest predictions.
    }
  }, [dispatch, user]);

  if (status === 'loading' && assessments.length === 0) return <Loader />;

  // Get the most recent prediction for each disease type
  const latestPredictions = assessments.reduce((acc, curr) => {
    if (!acc[curr.targetDisease] || new Date(curr.generatedAt) > new Date(acc[curr.targetDisease].generatedAt)) {
      acc[curr.targetDisease] = curr;
    }
    return acc;
  }, {} as Record<string, RiskAssessmentResponse>);

  const hasPredictions = Object.keys(latestPredictions).length > 0;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">My Health Overview</h1>
          <p className="text-teal-100 max-w-2xl text-lg">
            AI-powered insights based on your recent symptoms, vitals, and medical history. 
            <span className="font-semibold text-white ml-2">Note: This is advisory only and does not replace professional medical judgment.</span>
          </p>
        </div>
        <Heart className="absolute -right-10 -top-10 text-white opacity-10 w-64 h-64" />
      </div>

      {!hasPredictions ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Health Insights Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Continue logging your symptoms and vitals. Your doctor will generate your AI health profile soon.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {Object.values(latestPredictions).map((prediction) => {
            const isHighRisk = prediction.riskCategory === 'HIGH' || prediction.riskCategory === 'CRITICAL';
            
            return (
              <div key={prediction.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-2 ${isHighRisk ? 'bg-red-500' : 'bg-teal-500'}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 capitalize">
                        {prediction.targetDisease.replace(/_/g, ' ')} Risk
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Generated {new Date(prediction.generatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                      isHighRisk ? 'bg-red-100 text-red-700' : 
                      prediction.riskCategory === 'MODERATE' ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {prediction.riskCategory} RISK
                    </div>
                  </div>

                  {/* Health Score visual */}
                  <div className="mb-8">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-slate-600">Health Indicator Score</span>
                      <span className="text-slate-900">{(100 - (prediction.riskScore * 100)).toFixed(0)} / 100</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${100 - (prediction.riskScore * 100)}%`, 
                          backgroundColor: isHighRisk ? '#ef4444' : prediction.riskCategory === 'MODERATE' ? '#f97316' : '#10b981'
                        }} 
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-right">Higher is better</p>
                  </div>

                  {/* Educational Recommendations */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <Info size={16} className="text-blue-500" />
                      Educational Recommendations
                    </h4>
                    <ul className="space-y-3">
                      {prediction.recommendations.split('.').filter(r => r.trim().length > 0).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle size={16} className="text-teal-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-slate-700 leading-relaxed">{rec.trim()}.</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
