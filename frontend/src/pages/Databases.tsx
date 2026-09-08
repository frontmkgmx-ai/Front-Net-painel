import React, { useEffect, useState } from 'react';
import { Database, Plus, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../store/authStore';

export default function Databases() {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'MYSQL',
    version: 'latest'
  });

  const fetchDatabases = async () => {
    try {
      const res = await api.get('/databases');
      setDatabases(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
    const interval = setInterval(fetchDatabases, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/databases', formData);
      setShowCreate(false);
      fetchDatabases();
    } catch (e) {
      console.error(e);
      alert('Failed to create database');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this database? This will destroy all data.')) return;
    try {
      await api.delete(`/databases/${id}`);
      fetchDatabases();
    } catch (e) {
      console.error(e);
      alert('Failed to delete database');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Databases</h1>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Database
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Provision Database</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="MYSQL">MySQL</option>
                <option value="MARIADB">MariaDB</option>
                <option value="POSTGRES">PostgreSQL</option>
                <option value="MONGODB">MongoDB</option>
                <option value="REDIS">Redis</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Provision</button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {databases.map((db) => (
            <div key={db.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <Database className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{db.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {db.currentStatus === 'RUNNING' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                          <CheckCircle className="w-3 h-3" /> Running
                        </span>
                      ) : db.currentStatus === 'DEPLOYING' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                          <Loader2 className="w-3 h-3 animate-spin" /> Deploying
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded">
                          <XCircle className="w-3 h-3" /> {db.currentStatus}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{db.type} {db.version}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(db.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Host</div>
                    <div className="text-sm font-medium dark:text-white">mycloud_db_{db.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Internal Port</div>
                    <div className="text-sm font-medium dark:text-white">{db.internalPort}</div>
                  </div>
                  {db.dbName && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Database Name</div>
                      <div className="text-sm font-medium dark:text-white">{db.dbName}</div>
                    </div>
                  )}
                  {db.dbUser && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Username</div>
                      <div className="text-sm font-medium dark:text-white">{db.dbUser}</div>
                    </div>
                  )}
                  {db.dbPassword && (
                    <div className="col-span-2">
                      <div className="text-xs text-slate-500 mb-1">Password</div>
                      <div className="text-sm font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded dark:text-white select-all">
                        {db.dbPassword}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {databases.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No databases provisioned yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
