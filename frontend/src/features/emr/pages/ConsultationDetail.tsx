import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchConsultationById, fetchConsultationDetails } from '@/features/emr/emrSlice';
import { updateConsultationStatus } from '@/api/emrApi';
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, Pill, Stethoscope, Plus, ChevronRight, Loader2 } from 'lucide-react';
import type { ConsultationStatus } from '@/types/emr';

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentConsultation, diagnoses, prescriptions, treatmentNotes, loading } = useAppSelector((state) => state.emr);
  
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnoses' | 'prescriptions' | 'notes'>('diagnoses');

  const activeTabClass = "px-4 py-3 text-sm font-medium border-b-2 border-teal-600 text-teal-600";
  const inactiveTabClass = "px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors";

  useEffect(() => {
    if (id) {
      dispatch(fetchConsultationById(Number(id)));
      dispatch(fetchConsultationDetails(Number(id)));
    }
  }, [dispatch, id]);

  const handleStatusChange = async (status: ConsultationStatus) => {
    if (!id) return;
    setStatusUpdating(true);
    try {
      await updateConsultationStatus(Number(id), status);
      dispatch(fetchConsultationById(Number(id)));
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case 'OPEN': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><Clock size={12} /> Open</span>;
      case 'COMPLETED': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"><CheckCircle size={12} /> Completed</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"><XCircle size={12} /> Cancelled</span>;
    }
  };

  if (loading && !currentConsultation) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600" size={32} /></div>;
  }

  if (!currentConsultation) return null;

  const isDoctor = user?.role === 'DOCTOR';
  const isOpen = currentConsultation.status === 'OPEN';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/consultations')} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{currentConsultation.consultationNumber}</h1>
              {getStatusBadge(currentConsultation.status)}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Patient: <Link to={`/patients/${currentConsultation.patientId}`} className="text-teal-600 font-medium hover:underline">{currentConsultation.patientName}</Link>
              <span className="mx-2">•</span>
              Date: <span className="font-medium text-slate-700">{currentConsultation.consultationDate}</span>
            </p>
          </div>
        </div>
        
        {isDoctor && isOpen && (
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={statusUpdating}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={statusUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Mark Completed
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Chief Complaint</h3>
            <p className="text-slate-900">{currentConsultation.chiefComplaint}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Clinical Notes</h3>
            <p className="text-slate-900">{currentConsultation.consultationNotes || 'No initial notes provided.'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('diagnoses')} className={activeTab === 'diagnoses' ? activeTabClass : inactiveTabClass}>
            Diagnoses ({diagnoses.length})
          </button>
          <button onClick={() => setActiveTab('prescriptions')} className={activeTab === 'prescriptions' ? activeTabClass : inactiveTabClass}>
            Prescriptions ({prescriptions.length})
          </button>
          <button onClick={() => setActiveTab('notes')} className={activeTab === 'notes' ? activeTabClass : inactiveTabClass}>
            Treatment Notes ({treatmentNotes.length})
          </button>
        </div>

        <div className="p-6 bg-slate-50/50 min-h-[300px]">
          {activeTab === 'diagnoses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Recorded Diagnoses</h3>
                {isDoctor && isOpen && (
                  <Link to={`/consultations/${id}/diagnoses/new`} className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    <Plus size={16} /> Add Diagnosis
                  </Link>
                )}
              </div>
              {diagnoses.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No diagnoses recorded for this consultation.</p>
              ) : (
                <div className="grid gap-4">
                  {diagnoses.map((d) => (
                    <div key={d.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{d.diagnosisName}</span>
                          {d.diagnosisCode && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{d.diagnosisCode}</span>}
                        </div>
                        <p className="text-sm text-slate-600">{d.diagnosisDescription}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        d.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        d.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {d.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Prescriptions</h3>
                {isDoctor && isOpen && (
                  <Link to={`/consultations/${id}/prescriptions/new`} className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    <Plus size={16} /> Add Prescription
                  </Link>
                )}
              </div>
              {prescriptions.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No prescriptions generated yet.</p>
              ) : (
                <div className="grid gap-4">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-teal-700 font-medium">
                          <Pill size={16} /> Prescription Date: {rx.prescriptionDate}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {rx.medicines.map((m, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                            <div className="font-medium text-slate-900 w-1/3">{m.medicineName}</div>
                            <div className="text-slate-600 w-1/4">{m.dosage} • {m.frequency}</div>
                            <div className="text-slate-500 w-1/4 text-right">For {m.duration}</div>
                          </div>
                        ))}
                      </div>
                      {rx.notes && (
                        <div className="mt-4 pt-3 border-t border-slate-50 text-sm text-slate-600 italic">
                          "{rx.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Treatment Notes</h3>
                {isDoctor && isOpen && (
                  <Link to={`/consultations/${id}/notes/new`} className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    <Plus size={16} /> Add Note
                  </Link>
                )}
              </div>
              {treatmentNotes.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No treatment notes recorded.</p>
              ) : (
                <div className="grid gap-4">
                  {treatmentNotes.map((note) => (
                    <div key={note.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-900 mb-1">{note.title}</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.description}</p>
                      <div className="mt-3 text-xs text-slate-400">Recorded on {note.createdAt.split('T')[0]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
