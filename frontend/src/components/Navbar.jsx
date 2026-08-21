import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  CheckSquare, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Layers, 
  Bookmark, 
  RefreshCw,
  GitCompare,
  TrendingUp
} from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleRoleQuickSwitch = (role) => {
    if (role === 'admin') {
      login('admin@welfare.gov.in', 'password');
      navigate('/dashboard');
    } else {
      login('citizen@welfare.gov.in', 'password');
      navigate('/dashboard');
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-saffron flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/10">
                <CheckSquare size={22} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-gov-dark font-sans leading-tight">
                  AI Welfare <span className="text-gov-saffron">Copilot</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  Govt Scheme Finder
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/schemes"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/schemes')
                  ? 'bg-orange-50 text-gov-accent'
                  : 'text-slate-600 hover:text-gov-accent hover:bg-slate-50'
              }`}
            >
              Browse Schemes
            </Link>
            
            <Link
              to="/compare"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center space-x-1.5 ${
                isActive('/compare')
                  ? 'bg-orange-50 text-gov-accent'
                  : 'text-slate-600 hover:text-gov-accent hover:bg-slate-50'
              }`}
            >
              <GitCompare size={16} />
              <span>Compare</span>
            </Link>

            {user?.role === 'citizen' && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-orange-50 text-gov-accent'
                      : 'text-slate-600 hover:text-gov-accent hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/profile')
                      ? 'bg-orange-50 text-gov-accent'
                      : 'text-slate-600 hover:text-gov-accent hover:bg-slate-50'
                  }`}
                >
                  My Profile
                </Link>
                <Link
                  to="/favorites"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center space-x-1.5 ${
                    isActive('/favorites')
                      ? 'bg-orange-50 text-gov-accent'
                      : 'text-slate-600 hover:text-gov-accent hover:bg-slate-50'
                  }`}
                >
                  <Bookmark size={15} />
                  <span>Saved</span>
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center space-x-1.5 ${
                    isActive('/dashboard')
                      ? 'bg-slate-100 text-gov-dark font-semibold'
                      : 'text-slate-600 hover:text-gov-dark hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp size={15} />
                  <span>Admin Panel</span>
                </Link>
                <Link
                  to="/admin/sync"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center space-x-1.5 ${
                    isActive('/admin/sync')
                      ? 'bg-slate-100 text-gov-dark font-semibold'
                      : 'text-slate-600 hover:text-gov-dark hover:bg-slate-50'
                  }`}
                >
                  <RefreshCw size={15} />
                  <span>Sync Logs</span>
                </Link>
              </>
            )}
          </div>

          {/* Session Actions & Tester Switcher */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Switch Tester Pill */}
            <div className="bg-slate-100 p-1 rounded-full flex items-center space-x-1 border border-slate-200 text-xs font-semibold">
              <span className="text-[10px] text-slate-400 px-2 uppercase tracking-wider">Test Role:</span>
              <button
                onClick={() => handleRoleQuickSwitch('citizen')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  user?.role === 'citizen'
                    ? 'bg-gov-saffron text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Citizen
              </button>
              <button
                onClick={() => handleRoleQuickSwitch('admin')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  user?.role === 'admin'
                    ? 'bg-gov-dark text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Admin
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                {user.role === 'citizen' && (
                  <Link to="/notifications" className="relative p-2 text-slate-600 hover:text-gov-accent hover:bg-slate-50 rounded-full transition-all">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-gov-accent text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile Link or Dropdown */}
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-gov-dark leading-tight">
                      {user.role === 'admin' ? 'Administrator' : 'Rajesh Kumar'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wide">
                      {user.role}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-all ml-1"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-gov-accent transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-gradient-saffron text-white rounded-lg hover:shadow-md hover:shadow-orange-500/10 hover-lift transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-gov-accent hover:bg-slate-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-slate-100 px-2 pt-2 pb-4 space-y-1">
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-accent hover:bg-slate-50"
          >
            Browse Schemes
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-accent hover:bg-slate-50"
          >
            Compare Schemes
          </Link>

          {user?.role === 'citizen' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-accent hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-accent hover:bg-slate-50"
              >
                My Profile
              </Link>
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-accent hover:bg-slate-50"
              >
                Saved Schemes
              </Link>
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-accent hover:bg-slate-50"
              >
                Notifications ({unreadCount})
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-accent hover:bg-slate-50"
              >
                Admin Panel
              </Link>
              <Link
                to="/admin/sync"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-accent hover:bg-slate-50"
              >
                Sync Logs
              </Link>
            </>
          )}

          {/* Quick switcher in mobile menu */}
          <div className="pt-4 border-t border-slate-200 mt-2 px-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Simulate Role:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRoleQuickSwitch('citizen')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  user?.role === 'citizen' ? 'bg-gov-saffron text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Citizen
              </button>
              <button
                onClick={() => handleRoleQuickSwitch('admin')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  user?.role === 'admin' ? 'bg-gov-dark text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4 px-3 flex justify-between items-center">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="flex items-center text-rose-600 font-semibold text-sm"
              >
                <LogOut size={16} className="mr-1.5" />
                Sign Out
              </button>
            ) : (
              <div className="flex space-x-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold bg-gradient-saffron text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
