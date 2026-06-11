import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAppointments } from '../appointmentSlice';
import { checkInAppointment } from '@/api/appointmentApi';
import type { AppointmentStatus } from '@/types/appointment';
import { Search, Plus, Calendar, Clock, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';

export default function AppointmentList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { appointments, loading, totalPages } = useAppSelector(state => state.appointments);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const loadData = () => {
    dispatch(fetchAppointments({ 
      page, size, 
      date: filterDate || undefined, 
      status: filterStatus || undefined 
    }));
  };

  useEffect(() => {
    loadData();
  }, [dispatch, page, size, filterDate, filterStatus]);

  const handleCheckIn = async (id: number) => {
    try {
      await checkInAppointment(id);
      toast.success('Checked in successfully');
      loadData(); // Refresh
    } catch (err) {
      console.error(err);
      toast.error('Failed to check in');
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Scheduled</span>;
      case 'CONFIRMED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">Confirmed</span>;
      case 'CHECKED_IN': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">Checked In</span>;
      case 'IN_QUEUE': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">In Queue</span>;
      case 'IN_CONSULTATION': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">In Consultation</span>;
      case 'COMPLETED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Completed</span>;
      case 'CANCELLED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Cancelled</span>;
      case 'NO_SHOW': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">No Show</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all clinic appointments</p>
        </div>
        <Button onClick={() => navigate('/appointments/new')} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus size={18} className="mr-2" /> Book Appointment
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Date</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(0); }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="IN_QUEUE">In Queue</option>
              <option value="IN_CONSULTATION">In Consultation</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Apt No.</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-teal-600 mx-auto" size={24} />
                    <p className="text-slate-500 mt-2">Loading appointments...</p>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
                      <Calendar className="text-slate-400" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">No appointments found</p>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{apt.appointmentDate}</div>
                      <div className="text-xs text-slate-500">{apt.appointmentTime.substring(0,5)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{apt.appointmentNumber}</td>
                    <td className="px-6 py-4 text-slate-900">{apt.patientName}</td>
                    <td className="px-6 py-4">{apt.doctorName}</td>
                    <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                          <button 
                            onClick={() => handleCheckIn(apt.id)}
                            className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle size={14} /> Check In
                          </button>
                        )}
                        <Link 
                          to={`/appointments/${apt.id}`}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))} 
                disabled={page === 0}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
