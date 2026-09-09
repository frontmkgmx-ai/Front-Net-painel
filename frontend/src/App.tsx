import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  Shield, HardDrive, LayoutDashboard, Database, Server, Settings, Users, 
  LogOut, Lock, Box, Globe, ShieldCheck, Activity, FileText, ShoppingBag, 
  Key, Code, FolderGit2, Blocks, Cpu, Menu, X
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Storage from './pages/Storage';
import System from './pages/System';
import Docker from './pages/Docker';
import Login from './pages/Login';
import UsersPage from './pages/Users';
import Databases from './pages/Databases';
import Applications from './pages/Applications';
import Marketplace from './pages/Marketplace';
import Security from './pages/Security';
import SettingsPage from './pages/Settings';
import { useAuthStore } from './store/authStore';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col font-sans border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">MyCloud</h1>
              <span className="text-xs text-indigo-400 font-medium tracking-wider uppercase">Enterprise</span>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 pt-2">Core</div>
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Dashboard
          </Link>
          <Link to="/projects" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <FolderGit2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Projects
          </Link>
          <Link to="/applications" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Box className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Applications
          </Link>
          <Link to="/marketplace" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Marketplace
          </Link>
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 pt-4">Infrastructure</div>
          <Link to="/databases" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Database className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Databases
          </Link>
          <Link to="/services" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Blocks className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Services
          </Link>
          <Link to="/storage" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <HardDrive className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Storage
          </Link>
          <Link to="/docker" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Box className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Docker
          </Link>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 pt-4">Networking & Security</div>
          <Link to="/domains" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Globe className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Domains
          </Link>
          <Link to="/ssl" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> SSL
          </Link>
          <Link to="/secrets" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Key className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Secrets
          </Link>
          <Link to="/security" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Lock className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Security
          </Link>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 pt-4">Observability</div>
          <Link to="/monitoring" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Activity className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Monitoring
          </Link>
          <Link to="/logs" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Logs
          </Link>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 pt-4">Management</div>
          <Link to="/backups" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <HardDrive className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Backups
          </Link>
          <Link to="/api" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Code className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> API
          </Link>
          {user?.role === 'SUPER_ADMIN' && (
            <Link to="/users" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
              <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Users
            </Link>
          )}
          <Link to="/system" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Cpu className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> System
          </Link>
          <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition group">
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" /> Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="mb-3 text-xs text-slate-400 truncate flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            {user?.username || 'Guest'}
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            <h1 className="text-md font-bold text-white tracking-tight">MyCloud</h1>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-slate-300 p-1">
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// Placeholder components for new pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h1>
    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
      <p className="text-slate-500 dark:text-slate-400">This module is under construction.</p>
    </div>
  </div>
);

export default function App() {
  const initialize = useAuthStore(state => state.initialize);
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Layout><Placeholder title="Projects" /></Layout></PrivateRoute>} />
        <Route path="/applications" element={<PrivateRoute><Layout><Applications /></Layout></PrivateRoute>} />
        <Route path="/marketplace" element={<PrivateRoute><Layout><Marketplace /></Layout></PrivateRoute>} />
        <Route path="/services" element={<PrivateRoute><Layout><Placeholder title="Services" /></Layout></PrivateRoute>} />
        <Route path="/storage" element={<PrivateRoute><Layout><Storage /></Layout></PrivateRoute>} />
        <Route path="/docker" element={<PrivateRoute><Layout><Docker /></Layout></PrivateRoute>} />
        <Route path="/databases" element={<PrivateRoute><Layout><Databases /></Layout></PrivateRoute>} />
        <Route path="/domains" element={<PrivateRoute><Layout><Placeholder title="Domains" /></Layout></PrivateRoute>} />
        <Route path="/ssl" element={<PrivateRoute><Layout><Placeholder title="SSL Certificates" /></Layout></PrivateRoute>} />
        <Route path="/secrets" element={<PrivateRoute><Layout><Placeholder title="Secrets Management" /></Layout></PrivateRoute>} />
        <Route path="/monitoring" element={<PrivateRoute><Layout><Placeholder title="Monitoring" /></Layout></PrivateRoute>} />
        <Route path="/logs" element={<PrivateRoute><Layout><Placeholder title="Centralized Logs" /></Layout></PrivateRoute>} />
        <Route path="/backups" element={<PrivateRoute><Layout><Placeholder title="Backups" /></Layout></PrivateRoute>} />
        <Route path="/api" element={<PrivateRoute><Layout><Placeholder title="API Keys" /></Layout></PrivateRoute>} />
        <Route path="/security" element={<PrivateRoute><Layout><Security /></Layout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Layout><UsersPage /></Layout></PrivateRoute>} />
        <Route path="/system" element={<PrivateRoute><Layout><System /></Layout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
