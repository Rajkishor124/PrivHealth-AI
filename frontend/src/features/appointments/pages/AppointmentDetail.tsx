import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointment, cancelAppointment, rescheduleAppointment, checkInAppointment } from '@/api/appointmentApi';
import type { Appointment } from '@/types/appointment';
import { ArrowLeft, Calendar, Clock, User, Stethoscope, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reschedule dialog state
  const [openReschedule, setOpenReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAppointment = async () => {
    try {
      const res = await getAppointment(Number(id));
      setAppointment(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadAppointment();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(true);
    try {
      await cancelAppointment(appointment!.id);
      toast.success('Appointment cancelled');
      await loadAppointment();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
    setActionLoading(false);
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkInAppointment(appointment!.id);
      toast.success('Patient checked in successfully');
      await loadAppointment();
    } catch (err) {
      toast.error('Failed to check in');
    }
    setActionLoading(false);
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    setActionLoading(true);
    try {
      await rescheduleAppointment(appointment!.id, { appointmentDate: newDate, appointmentTime: newTime });
      toast.success('Appointment rescheduled');
      setOpenReschedule(false);
      await loadAppointment();
    } catch (err) {
      toast.error('Failed to reschedule');
    }
    setActionLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-teal-600" size={32} /></div>;
  }

  if (!appointment) {
    return <div className="text-center p-12 text-red-500 font-medium">Appointment not found.</div>;
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'CHECKED_IN': return 'bg-teal-100 text-teal-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointment Details</h1>
            <p className="text-sm text-slate-500 mt-1">{appointment.appointmentNumber}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(appointment.status)}`}>
          {appointment.status.replace('_', ' ')}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Patient</p>
                  <p className="text-lg font-bold text-slate-900">{appointment.patientName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Stethoscope size={20} /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Doctor</p>
                  <p className="text-lg font-bold text-slate-900">{appointment.doctorName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar size={20} /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Date & Time</p>
                  <p className="text-lg font-bold text-slate-900">{appointment.appointmentDate}</p>
                  <p className="text-slate-600">{appointment.appointmentTime.substring(0,5)}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                <FileText size={16} /> Reason for Visit
              </p>
              <p className="text-slate-900">{appointment.reasonForVisit || 'Not specified'}</p>
            </div>
            
            {appointment.notes && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-2">Additional Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
          <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-wrap gap-3">
            <Button onClick={handleCheckIn} isLoading={actionLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
              <CheckCircle size={18} className="mr-2" /> Check In Patient
            </Button>
            <Button variant="secondary" onClick={() => setOpenReschedule(true)} disabled={actionLoading}>
              <Clock size={18} className="mr-2" /> Reschedule
            </Button>
            <Button variant="danger" onClick={handleCancel} disabled={actionLoading}>
              <XCircle size={18} className="mr-2" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {openReschedule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Reschedule Appointment</h3>
              <div className="space-y-4">
                <Input
                  label="New Date"
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                />
                <Input
                  label="New Time"
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpenReschedule(false)}>Cancel</Button>
              <Button onClick={handleReschedule} isLoading={actionLoading} disabled={!newDate || !newTime}>Confirm Reschedule</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
