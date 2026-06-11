import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAuditLogs } from '../adminSlice';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SystemReports() {
  const dispatch = useAppDispatch();
  const { auditLogs, auditMeta } = useAppSelector((s) => s.admin);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(fetchAuditLogs({ page, size: 20 }));
  }, [dispatch, page]);

  const actionColor = (action: string): string => {
    if (action.includes('DELETE')) return 'text-red-600 bg-red-50';
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'text-emerald-600 bg-emerald-50';
    if (action.includes('APPROVED')) return 'text-teal-600 bg-teal-50';
    if (action.includes('REJECTED')) return 'text-red-600 bg-red-50';
    if (action.includes('LOGIN_FAILED')) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Audit Logs</h1>

      {auditLogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <FileText size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No audit logs found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Time</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Action</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Entity</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Details</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-3 text-sm text-slate-700">{log.userName ?? `ID:${log.userId}`}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{log.entityType} #{log.entityId}</td>
                    <td className="px-6 py-3 text-xs text-slate-500 max-w-xs truncate">{log.details ?? '—'}</td>
                    <td className="px-6 py-3 text-xs text-slate-400 font-mono">{log.ipAddress ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {auditMeta && auditMeta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">Page {auditMeta.page + 1} of {auditMeta.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= auditMeta.totalPages - 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
