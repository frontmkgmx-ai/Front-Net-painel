import React, { useEffect, useState } from 'react';
import { Database, Activity, Cpu, HardDrive } from 'lucide-react';
import { api } from '../store/authStore';

export default function Databases() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.get('/health').then(res => setHealth(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">Databases</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MySQL */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">MySQL</h2>
              <span className={`text-sm ${health?.mysql ? 'text-green-500' : 'text-red-500'}`}>
                {health?.mysql ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> Uptime</span>
              <span>{Math.floor((health?.uptime || 0) / 3600)}h</span>
            </div>
          </div>
        </div>

        {/* MongoDB */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">MongoDB</h2>
              <span className={`text-sm ${health?.mongodb ? 'text-green-500' : 'text-red-500'}`}>
                {health?.mongodb ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> Uptime</span>
              <span>{Math.floor((health?.uptime || 0) / 3600)}h</span>
            </div>
          </div>
        </div>

        {/* Redis */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Redis</h2>
              <span className={`text-sm ${health?.redis ? 'text-green-500' : 'text-red-500'}`}>
                {health?.redis ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> Uptime</span>
              <span>{Math.floor((health?.uptime || 0) / 3600)}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
