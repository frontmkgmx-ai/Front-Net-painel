import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Shield, HardDrive, LayoutDashboard, Database, Server, Settings, Users, LogOut, Lock, Box } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Storage from './pages/Storage';
import System from './pages/System';
import Docker from './pages/Docker';
import Login from './pages/Login';
import UsersPage from './pages/Users';
import Databases from './pages/Databases';
import Security from './pages/Security';
import SettingsPage from './pages/Settings';
import { useAuthStore } from './store/authStore';

const Sidebar = () => {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-slate-800">
        <Shield className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold">MyCloud Panel</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link to="/" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 transition">
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </Link>
        <Link to="/storage" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 transition">
          <HardDrive className="w-5 h-5" /> Storage
        </Link>
        <Link to="/databases" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 transition">
          <Database className="w-5 h-5" /> Databases
        </Link>
        <Link to="/docker" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 transition">
          <Box className="w-5 h-5" /> Docker
        </Link>
        <Link to="/system" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 transition">
          <Server className="w-5 h-5" /> System
        </Link>
        <Link to="/security" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 transition">
          <Lock className="w-5 h-5" /> Security
        </Link>
        {user?.role === 'SUPER_ADMIN' && (
          <Link to="/users" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 transition">
            <Users className="w-5 h-5" /> Users
          </Link>
        )}
        <Link to="/settings" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 transition">
          <Settings className="w-5 h-5" /> Settings
        </Link>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 text-sm text-slate-400 truncate">
          Logged in as: <span className="text-white font-medium">{user?.username}</span>
        </div>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 p-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

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
        <Route path="/storage" element={<PrivateRoute><Layout><Storage /></Layout></PrivateRoute>} />
        <Route path="/system" element={<PrivateRoute><Layout><System /></Layout></PrivateRoute>} />
        <Route path="/docker" element={<PrivateRoute><Layout><Docker /></Layout></PrivateRoute>} />
        <Route path="/databases" element={<PrivateRoute><Layout><Databases /></Layout></PrivateRoute>} />
        <Route path="/security" element={<PrivateRoute><Layout><Security /></Layout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Layout><UsersPage /></Layout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
