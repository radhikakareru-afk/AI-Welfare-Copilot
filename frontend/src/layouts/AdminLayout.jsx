import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home,
  LayoutDashboard, 
  RefreshCw, 
  FileText, 
  Users, 
  TrendingUp, 
  HeartPulse, 
  LogOut, 
  Menu, 
  X,
  CheckSquare
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminMenuItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Sync Monitor', path: '/admin/synchronization', icon: RefreshCw },
    { label: 'Sync Logs', path: '/admin/synchronization/logs', icon: FileText },
    { label: 'User Monitoring', path: '/admin/users', icon: Users },
    { label: 'Analytics & Reports', path: '/admin/analytics', icon: TrendingUp },
    { label: 'System Health', path: '/admin/system-health', icon: HeartPulse }
  ];

  const AdminSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-400 font-sans border-r border-slate-800">
      {/* Brand logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/20">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center text-white font-bold">
            <CheckSquare size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm tracking-tight text-white leading-tight">
              AI Welfare <span className="text-gov-purple-light text-purple-400">Copilot</span>
            </span>
            <span className="text-[9px] text-gov-purple font-semibold tracking-wider uppercase">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 py-6 px-4 overflow-y-auto space-y-7 text-xs text-left">
        <div className="space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:text-white hover:bg-slate-800/60 transition-all font-semibold"
          >
            <Home size={16} />
            <span>Go to Public Site</span>
          </Link>
        </div>

        {/* Primary Options */}
        <div className="space-y-1">
          <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Monitoring</span>
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
                  active 
                    ? 'bg-gov-purple text-white shadow-md shadow-purple-500/10' 
                    : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout / User Details */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-2 overflow-hidden text-left">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 font-bold uppercase">
            A
          </div>
          <div className="truncate">
            <span className="font-bold text-white block truncate">Admin Node</span>
            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block">Development Mode</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-800/40 transition-all shrink-0"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gov-light text-slate-800">
      {/* Desktop Sidebar wrapper */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <AdminSidebarContent />
      </aside>

      {/* Main section */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg mr-2"
            >
              <Menu size={22} />
            </button>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline-block">
              Welfare Database Admin Telemetry
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
              <span className="text-xs font-bold text-slate-700 hidden sm:inline-block">
                Sys Admin
              </span>
              <div className="w-8 h-8 rounded-full bg-gov-purple-light text-gov-purple-dark flex items-center justify-center font-bold text-xs">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-grow p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Mask overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-filter backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          
          <div className="relative w-64 h-full flex flex-col z-10 animate-slide-in">
            {/* Close button inside Drawer */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-[-44px] p-2 bg-slate-900 text-white rounded-r-lg"
            >
              <X size={20} />
            </button>
            <div className="h-full">
              <AdminSidebarContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
