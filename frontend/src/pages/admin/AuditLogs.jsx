import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowLeft, ShieldCheck, Database, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.getAuditLogs();
        if (res.success && res.logs) {
          setLogs(res.logs);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Console</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-brand-emerald text-xs font-semibold uppercase tracking-wider mb-1">
          <History className="w-4 h-4" />
          <span>Security & Compliance Record</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          System Audit Trail Logs
        </h1>
        <p className="text-slate-400 mt-1">
          Tamper-evident record of all administrative actions, idea reviews, and privilege state modifications.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={4} />
      ) : logs.length > 0 ? (
        <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Admin Actor</th>
                  <th className="p-4">Action Code</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Operational Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40">
                    <td className="p-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.created_at}
                    </td>

                    <td className="p-4 font-semibold text-white">
                      {log.admin_name || 'System Auto'}
                      {log.admin_email && (
                        <span className="text-[11px] text-slate-400 block">{log.admin_email}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300">
                      <span className="font-mono text-brand-blue">{log.target_type}</span>
                      {log.target_id ? ` #${log.target_id}` : ''}
                    </td>

                    <td className="p-4 text-slate-300 max-w-md truncate font-mono text-[11px]">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">No audit entries recorded yet.</div>
      )}
    </div>
  );
}
