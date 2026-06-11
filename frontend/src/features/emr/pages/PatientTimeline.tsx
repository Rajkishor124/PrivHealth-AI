import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchTimeline } from '@/features/emr/emrSlice';
import { ArrowLeft, Loader2, Stethoscope, Pill, FileText, FileBarChart, AlertCircle, Calendar } from 'lucide-react';
import type { MedicalTimelineItem } from '@/types/emr';

export default function PatientTimeline() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { timeline, loading } = useAppSelector((state) => state.emr);
  
  // For patients viewing their own history, id might not be in URL (e.g. /medical-history).
  // If id is present, it's a doctor/admin. Otherwise 'me'.
  const patientId = id ? Number(id) : 'me';

  useEffect(() => {
    dispatch(fetchTimeline(patientId));
  }, [dispatch, patientId]);

  const getIcon = (type: MedicalTimelineItem['type']) => {
    switch (type) {
      case 'CONSULTATION': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Stethoscope size={20} /></div>;
      case 'DIAGNOSIS': return <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><AlertCircle size={20} /></div>;
      case 'PRESCRIPTION': return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><Pill size={20} /></div>;
      case 'TREATMENT_NOTE': return <div className="p-2 bg-amber-100 text-amber-600 rounded-full"><FileText size={20} /></div>;
      case 'REPORT': return <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><FileBarChart size={20} /></div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical History Timeline</h1>
          <p className="text-sm text-slate-500 mt-1">Chronological view of medical events</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600" size={32} /></div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Calendar className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No History Found</h3>
            <p className="text-slate-500 mt-1">There are no medical records for this patient yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 py-4 space-y-8">
            {timeline.map((item, index) => (
              <div key={`${item.type}-${item.id}-${index}`} className="relative pl-8 md:pl-12">
                <div className="absolute -left-[21px] top-0 bg-white p-1 rounded-full border border-slate-200">
                  {getIcon(item.type)}
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.type.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                      <Calendar size={14} /> {item.date}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-slate-700 text-sm mb-3 bg-white p-3 rounded-lg border border-slate-100">{item.description}</p>
                  )}
                  <div className="text-xs text-slate-500 font-medium">
                    Attending: {item.doctorName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
