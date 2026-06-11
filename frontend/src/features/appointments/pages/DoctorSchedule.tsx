import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchDoctorSchedule } from '../appointmentSlice';
import { format } from 'date-fns';
import { Calendar, Loader2 } from 'lucide-react';
import Input from '@/components/common/Input';

export default function DoctorSchedule() {
  const dispatch = useAppDispatch();
  const { doctorSchedule, loading } = useAppSelector(state => state.appointments);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(fetchDoctorSchedule(filterDate));
  }, [dispatch, filterDate]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">View your appointments for a specific date</p>
        </div>
        <div className="w-48">
          <Input
            type="date"
            label="Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-teal-600 mx-auto" size={24} />
                    <p className="text-slate-500 mt-2">Loading schedule...</p>
                  </td>
                </tr>
              ) : doctorSchedule.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
                      <Calendar className="text-slate-400" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">No appointments scheduled for this date</p>
                  </td>
                </tr>
              ) : (
                doctorSchedule.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{apt.appointmentTime.substring(0,5)}</td>
                    <td className="px-6 py-4 font-medium">{apt.patientName}</td>
                    <td className="px-6 py-4">{apt.reasonForVisit || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {apt.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
