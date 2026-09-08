import React, { useEffect, useState } from 'react';
import { Box, Play, Square, RefreshCw, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../store/authStore';

export default function Applications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      const res = await api.get('/apps');
      setApps(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    const interval = setInterval(fetchApps, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this application?')) return;
        await api.delete(`/apps/${id}`);
      } else {
        await api.post(`/apps/${id}/${action}`);
      }
      fetchApps();
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} app`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Applications</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg">
                  <Box className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{app.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {app.currentStatus === 'RUNNING' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" /> Running
                      </span>
                    ) : app.currentStatus === 'DEPLOYING' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                        <Loader2 className="w-3 h-3 animate-spin" /> Deploying
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-500/10 px-2 py-1 rounded">
                        <XCircle className="w-3 h-3" /> {app.currentStatus}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{app.imageName}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction(app.id, 'start')}
                  disabled={app.currentStatus === 'RUNNING' || app.currentStatus === 'DEPLOYING'}
                  className="p-2 text-slate-400 hover:text-emerald-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                  title="Start"
                >
                  <Play className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleAction(app.id, 'stop')}
                  disabled={app.currentStatus !== 'RUNNING'}
                  className="p-2 text-slate-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                  title="Stop"
                >
                  <Square className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleAction(app.id, 'deploy')}
                  disabled={app.currentStatus === 'DEPLOYING'}
                  className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                  title="Redeploy"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleAction(app.id, 'delete')}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {apps.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No applications deployed yet. Head to the Marketplace to install one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
