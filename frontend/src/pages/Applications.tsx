import React, { useEffect, useState } from 'react';
import { Box, Play, Square, RefreshCw, Trash2, Loader2, CheckCircle, XCircle, FileText, X } from 'lucide-react';
import { api } from '../store/authStore';

export default function Applications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploymentsModal, setDeploymentsModal] = useState<{appId: string, name: string} | null>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loadingDeployments, setLoadingDeployments] = useState(false);

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

  const openDeployments = async (appId: string, name: string) => {
    setDeploymentsModal({appId, name});
    setLoadingDeployments(true);
    try {
      const res = await api.get(`/apps/${appId}/deployments`);
      setDeployments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDeployments(false);
    }
  };

  const refreshDeployments = async () => {
    if (!deploymentsModal) return;
    try {
      const res = await api.get(`/apps/${deploymentsModal.appId}/deployments`);
      setDeployments(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    let intv: any;
    if (deploymentsModal) {
      intv = setInterval(refreshDeployments, 3000);
    }
    return () => clearInterval(intv);
  }, [deploymentsModal]);

  return (
    <div className="p-8 relative">
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
                    ) : app.currentStatus === 'QUEUED' || app.currentStatus === 'DEPLOYING' ? (
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
                  onClick={() => openDeployments(app.id, app.name)}
                  className="p-2 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Deployments"
                >
                  <FileText className="w-5 h-5" />
                </button>
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
                  disabled={app.currentStatus === 'DEPLOYING' || app.currentStatus === 'QUEUED'}
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

      {/* Deployments Modal */}
      {deploymentsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Deployments: {deploymentsModal.name}
              </h2>
              <button onClick={() => setDeploymentsModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingDeployments ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
              ) : deployments.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No deployment history found.</div>
              ) : (
                deployments.map(dep => (
                  <div key={dep.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${dep.status === 'SUCCESS' ? 'text-emerald-500' : dep.status === 'FAILED' ? 'text-red-500' : 'text-amber-500'}`}>
                          {dep.status}
                        </span>
                        <span className="text-slate-400">{new Date(dep.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-slate-400 text-xs">ID: {dep.id}</div>
                    </div>
                    <div className="p-4 bg-black text-green-400 font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                      <pre>{dep.logs || 'No logs available.'}</pre>
                      {dep.error && <pre className="text-red-400 mt-2">{dep.error}</pre>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
