import React, { useEffect, useState } from 'react';
import { api } from '../store/authStore';
import { ShieldAlert, Server, Activity } from 'lucide-react';

export default function System() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/system/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/system/audit-logs');
      setLogs(res.data.logs);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System & Security</h1>
          <p className="text-slate-500">System information and audit logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" /> System Info
            </h2>
            
            {stats ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Hostname</div>
                  <div className="text-slate-900 dark:text-white mt-1">{stats.os.hostname}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">OS Release</div>
                  <div className="text-slate-900 dark:text-white mt-1">{stats.os.platform} - {stats.os.release}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Architecture</div>
                  <div className="text-slate-900 dark:text-white mt-1">{stats.os.arch}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Node Version</div>
                  <div className="text-slate-900 dark:text-white mt-1">{stats.app.nodeVersion}</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500">Loading...</div>
            )}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audit Logs</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium">Time</th>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {log.user?.username || 'System'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {log.ipAddress || '-'}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No audit logs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
