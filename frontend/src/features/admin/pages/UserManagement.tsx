import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchUsers, deleteUser } from '../adminSlice';
import { StatusBadge } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const dispatch = useAppDispatch();
  const { users, usersMeta } = useAppSelector((s) => s.admin);
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchUsers({ role: roleFilter || undefined, page, size: 15 }));
  }, [dispatch, page, roleFilter]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const result = await dispatch(deleteUser(id));
    if (deleteUser.fulfilled.match(result)) toast.success('User deleted');
    else toast.error((result.payload as string) || 'Delete failed');
    setDeleting(null);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">User Management</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['', 'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'PATIENT'].map((r) => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              roleFilter === r
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            {r || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Joined</th>
              <th className="px-6 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    (u.role === 'SUPER_ADMIN' || u.role === 'HOSPITAL_ADMIN') ? 'bg-purple-100 text-purple-700'
                    : u.role === 'DOCTOR' ? 'bg-teal-100 text-teal-700'
                    : 'bg-blue-100 text-blue-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-6 py-4"><StatusBadge status={u.staffStatus} /></td>
                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(u.id, u.name)} isLoading={deleting === u.id}>
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usersMeta && usersMeta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">Page {usersMeta.page + 1} of {usersMeta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= usersMeta.totalPages - 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
