import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchConsultations } from '@/features/emr/emrSlice';
import { Search, Plus, Stethoscope, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { ConsultationStatus } from '@/types/emr';

export default function ConsultationList() {
  const dispatch = useAppDispatch();
  const { consultations, loading } = useAppSelector((state) => state.emr);
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchConsultations({ page: 0, size: 20, search: searchTerm }));
  }, [dispatch, searchTerm]);

  const getStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><Clock size={12} /> Open</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"><CheckCircle size={12} /> Completed</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"><XCircle size={12} /> Cancelled</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage patient visits and medical records</p>
        </div>
        
        {user?.role === 'DOCTOR' && (
          <Link
            to="/consultations/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus size={18} />
            New Consultation
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by consultation number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : !consultations?.content || consultations.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
                      <Stethoscope className="text-slate-400" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">No consultations found</p>
                  </td>
                </tr>
              ) : (
                consultations.content.map((consult) => (
                  <tr key={consult.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/consultations/${consult.id}`} className="font-medium text-teal-600 hover:text-teal-700">
                        {consult.consultationNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{consult.patientName}</td>
                    <td className="px-6 py-4">{consult.doctorName}</td>
                    <td className="px-6 py-4">{consult.consultationDate}</td>
                    <td className="px-6 py-4">{consult.consultationType.replace('_', ' ')}</td>
                    <td className="px-6 py-4">{getStatusBadge(consult.status)}</td>
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
