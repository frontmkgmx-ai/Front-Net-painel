import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, Key, Activity } from 'lucide-react';

export default function Security() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">Security</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Active Security Alerts
            </h2>
          </div>
          <div className="p-6 text-slate-600 dark:text-slate-400">
            No active security threats detected. System is running securely.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Recent Logins
            </h2>
          </div>
          <div className="p-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p>IP: 192.168.1.1 (Success)</p>
              <p>Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
