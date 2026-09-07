import React, { useEffect, useState } from 'react';
import { api } from '../store/authStore';
import { Server, Cpu, HardDrive, Clock, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/system/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for charts since we don't have historical data yet
  const chartData = [
    { name: '00:00', cpu: 30, ram: 45 },
    { name: '04:00', cpu: 20, ram: 40 },
    { name: '08:00', cpu: 50, ram: 60 },
    { name: '12:00', cpu: 80, ram: 75 },
    { name: '16:00', cpu: 65, ram: 65 },
    { name: '20:00', cpu: 40, ram: 50 },
    { name: '24:00', cpu: 30, ram: 45 },
  ];

  if (!stats) return <div className="p-8">Loading dashboard...</div>;

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const uptimeHours = Math.floor(stats.os.uptime / 3600);
  const memUsedPercent = Math.round((stats.memory.used / stats.memory.total) * 100);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500">System overview and metrics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">CPU Load</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.cpu.loadavg[0].toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            {stats.cpu.cores} Cores • {stats.cpu.model.substring(0, 20)}...
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Memory Usage</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {memUsedPercent}%
              </h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            {formatBytes(stats.memory.used)} / {formatBytes(stats.memory.total)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">System Uptime</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {uptimeHours}h
              </h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Node: {stats.app.nodeVersion}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Platform</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 truncate">
                {stats.os.platform} {stats.os.arch}
              </h3>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
              <Server className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500 truncate">
            {stats.os.release}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Resource Utilization</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
              <Area type="monotone" dataKey="ram" stroke="#a855f7" fillOpacity={1} fill="url(#colorRam)" name="RAM %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
