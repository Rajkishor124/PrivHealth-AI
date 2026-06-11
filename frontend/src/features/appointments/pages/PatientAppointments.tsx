import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyAppointments } from '../appointmentSlice';
import type { AppointmentStatus } from '@/types/appointment';
import { Calendar, Loader2 } from 'lucide-react';

export default function PatientAppointments() {
  const dispatch = useAppDispatch();
  const { myAppointments, loading, totalPages } = useAppSelector(state => state.appointments);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  useEffect(() => {
    dispatch(fetchMyAppointments({ page, size }));
  }, [dispatch, page, size]);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Scheduled</span>;
      case 'CONFIRMED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">Confirmed</span>;
      case 'CHECKED_IN': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">Checked In</span>;
      case 'IN_QUEUE': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">In Queue</span>;
      case 'IN_CONSULTATION': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">In Consultation</span>;
      case 'COMPLETED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Completed</span>;
      case 'CANCELLED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Cancelled</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
        <p className="text-sm text-slate-500 mt-1">View your past and upcoming appointments</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-teal-600 mx-auto" size={24} />
                    <p className="text-slate-500 mt-2">Loading appointments...</p>
                  </td>
                </tr>
              ) : myAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
                      <Calendar className="text-slate-400" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">You have no appointments.</p>
                  </td>
                </tr>
              ) : (
                myAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{apt.appointmentDate}</div>
                      <div className="text-xs text-slate-500">{apt.appointmentTime.substring(0,5)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{apt.doctorName}</td>
                    <td className="px-6 py-4">{apt.reasonForVisit || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
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
