import React, { useEffect, useState } from 'react';
import { api } from '../store/authStore';
import { Play, Square, RotateCw, Activity, Terminal } from 'lucide-react';

interface Container {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
}

export default function Docker() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/docker/containers');
      setContainers(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch containers. Make sure you are an Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await api.post(`/docker/containers/${id}/${action}`);
      fetchContainers();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Docker Management</h1>
      
      {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Containers</h2>
          <button onClick={fetchContainers} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            Refresh
          </button>
        </div>
        
        {loading && containers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Loading containers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50">
                  <th className="p-4 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-400">Name</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-400">Image</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-400">State</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((c) => (
                  <tr key={c.Id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4 border-b border-slate-200 dark:border-slate-800 font-mono text-sm">{c.Names[0].replace('/', '')}</td>
                    <td className="p-4 border-b border-slate-200 dark:border-slate-800 text-sm truncate max-w-xs">{c.Image}</td>
                    <td className="p-4 border-b border-slate-200 dark:border-slate-800">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${c.State === 'running' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {c.State}
                      </span>
                    </td>
                    <td className="p-4 border-b border-slate-200 dark:border-slate-800 text-sm">{c.Status}</td>
                    <td className="p-4 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {c.State !== 'running' && (
                          <button onClick={() => handleAction(c.Id, 'start')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Start">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {c.State === 'running' && (
                          <>
                            <button onClick={() => handleAction(c.Id, 'stop')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Stop">
                              <Square className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction(c.Id, 'restart')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Restart">
                              <RotateCw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {containers.length === 0 && !loading && (
                   <tr>
                     <td colSpan={5} className="p-8 text-center text-slate-500">No containers found</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
