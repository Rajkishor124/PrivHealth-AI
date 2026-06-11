import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPatients } from '../patientSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { RiskBadge } from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import { Search, Plus, ChevronLeft, ChevronRight, User, Phone } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientList() {
  const dispatch = useAppDispatch();
  const { list, meta, status } = useAppSelector((s) => s.patients);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search);

  const canCreate = user?.role === 'RECEPTIONIST' || user?.role === 'HOSPITAL_ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    dispatch(fetchPatients({ page, size: 15, search: debouncedSearch || undefined }));
  }, [dispatch, page, debouncedSearch]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">{meta?.totalElements ?? 0} total patients</p>
        </div>
        {canCreate && (
          <Link to="/patients/new">
            <Button><Plus size={16} /> Register Patient</Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
        />
      </div>

      {status === 'loading' && <Loader />}

      {status !== 'loading' && list.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <User size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No patients found</p>
          {canCreate && (
            <Link to="/patients/new" className="text-teal-600 text-sm font-medium hover:text-teal-700 mt-2 inline-block">Register your first patient →</Link>
          )}
        </div>
      )}

      {list.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Added</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                          {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{p.firstName} {p.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{calculateAge(p.dateOfBirth)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.gender}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {p.phone ? (
                        <span className="flex items-center gap-1"><Phone size={12} className="text-slate-400" />{p.phone}</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4"><RiskBadge category={p.lastRiskCategory} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/patients/${p.id}`} className="text-sm text-teal-600 font-medium hover:text-teal-700">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Page {meta.page + 1} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages - 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
