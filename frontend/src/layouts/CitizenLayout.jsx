import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Home,
  LayoutDashboard, 
  User, 
  CheckSquare, 
  Layers, 
  Heart, 
  GitCompare, 
  Bookmark, 
  Clock, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

export default function CitizenLayout({ children }) {
  const { user, logout, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [schemesMenuExpanded, setSchemesMenuExpanded] = useState(true);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Check Eligibility', path: '/eligibility', icon: CheckSquare },
  ];

  const schemesSubItems = [
    { label: 'Eligible Schemes', path: '/eligible-schemes', icon: AlertCircle },
    { label: 'All Schemes', path: '/schemes/all', icon: Layers },
    { label: 'Compare Schemes', path: '/compare', icon: GitCompare },
    { label: 'Saved Bookmarks', path: '/favorites', icon: Bookmark },
    { label: 'Recently Viewed', path: '/recently-viewed', icon: Clock },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-400 font-sans border-r border-slate-800">
      {/* Brand logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/20">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-green flex items-center justify-center text-white font-bold">
            <CheckSquare size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm tracking-tight text-white leading-tight">
              AI Welfare <span className="text-gov-purple-light text-purple-400">Copilot</span>
            </span>
            <span className="text-[9px] text-gov-green font-bold tracking-wider uppercase">
              Citizen Portal
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
          <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Main Menu</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
                  active 
                    ? 'bg-gov-green text-white shadow-md shadow-emerald-500/10' 
                    : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Schemes Sub Menu */}
        <div className="space-y-1">
          <button
            onClick={() => setSchemesMenuExpanded(!schemesMenuExpanded)}
            className="w-full flex items-center justify-between px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2"
          >
            <span>Schemes Hub</span>
            {schemesMenuExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          
          {schemesMenuExpanded && (
            <div className="space-y-1 pl-1 border-l border-slate-800 ml-3">
              {schemesSubItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all font-medium ${
                      active 
                        ? 'bg-slate-800 text-white font-bold' 
                        : 'hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Secondary options */}
        <div className="space-y-1">
          <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Account</span>
          <Link
            to="/notifications"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-semibold ${
              isActive('/notifications')
                ? 'bg-gov-green text-white shadow-md shadow-emerald-500/10'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell size={16} />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-gov-purple rounded-full shrink-0">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
              isActive('/settings')
                ? 'bg-gov-green text-white shadow-md shadow-emerald-500/10'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings size={16} />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Logout / User Details */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-2 overflow-hidden text-left">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 font-bold uppercase">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="truncate">
            <span className="font-bold text-white block truncate">{profile?.full_name || 'User'}</span>
            <span className="text-[10px] text-slate-500 truncate block">Citizen Account</span>
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
        <SidebarContent />
      </aside>

      {/* Main section */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        
        {/* Top Portal Header */}
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
              Republic of India Welfare Engine
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <Link 
              to="/notifications" 
              className="relative p-2 text-slate-600 hover:text-gov-green hover:bg-slate-50 rounded-full transition-all"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-gov-purple text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile display badge */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
              <span className="text-xs font-bold text-slate-700 hidden sm:inline-block">
                {profile?.full_name || 'User'}
              </span>
              <div className="w-8 h-8 rounded-full bg-gov-green-light text-gov-green-dark flex items-center justify-center font-bold text-xs">
                {profile?.full_name?.charAt(0) || 'U'}
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
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
