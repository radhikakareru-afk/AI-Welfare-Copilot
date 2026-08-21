import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
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
  TrendingUp,
  Info,
  HelpCircle,
  Mail,
  Home
} from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;


  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-green flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/10">
                <CheckSquare size={22} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-xl tracking-tight text-gov-dark font-sans leading-tight">
                  AI Welfare <span className="text-gov-purple">Copilot</span>
                </span>
                <span className="text-[10px] text-gov-green font-bold tracking-wider uppercase">
                  Welfare Portal Demo
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/')
                  ? 'bg-gov-green-light text-gov-green-dark'
                  : 'text-slate-600 hover:text-gov-green hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/about')
                  ? 'bg-gov-green-light text-gov-green-dark'
                  : 'text-slate-600 hover:text-gov-green hover:bg-slate-50'
              }`}
            >
              About
            </Link>
            <Link
              to="/how-it-works"
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/how-it-works')
                  ? 'bg-gov-green-light text-gov-green-dark'
                  : 'text-slate-600 hover:text-gov-green hover:bg-slate-50'
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/schemes"
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/schemes')
                  ? 'bg-gov-green-light text-gov-green-dark'
                  : 'text-slate-600 hover:text-gov-green hover:bg-slate-50'
              }`}
            >
              Browse Schemes
            </Link>
            <Link
              to="/faq"
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/faq')
                  ? 'bg-gov-green-light text-gov-green-dark'
                  : 'text-slate-600 hover:text-gov-green hover:bg-slate-50'
              }`}
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive('/contact')
                  ? 'bg-gov-green-light text-gov-green-dark'
                  : 'text-slate-600 hover:text-gov-green hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Session Actions & Tester Switcher */}
          <div className="hidden md:flex items-center space-x-3">

            {user ? (
              user.role === 'citizen' ? (
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50">
                    Welcome, Citizen
                  </span>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50">
                    Admin
                  </span>
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-gov-purple hover:bg-gov-purple-dark text-white font-bold text-xs rounded-lg transition-all hover-lift shadow-sm"
                  >
                    Admin Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </div>
              )
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gov-green hover:bg-gov-green-dark text-white rounded-xl shadow-md shadow-emerald-500/10 hover-lift transition-all"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-gov-green hover:bg-slate-50 focus:outline-none"
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
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-green hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-green hover:bg-slate-50"
          >
            About
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-green hover:bg-slate-50"
          >
            How It Works
          </Link>
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-green hover:bg-slate-50"
          >
            Browse Schemes
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-green hover:bg-slate-50"
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-gov-green hover:bg-slate-50"
          >
            Contact
          </Link>


          <div className="pt-4 border-t border-slate-200 mt-4 px-3">
            {user ? (
              <div className="flex flex-col space-y-3">
                {user.role === 'citizen' ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-650 bg-slate-100 px-2.5 py-1 rounded">
                      Welcome, Citizen
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <span className="text-xs font-bold text-slate-650 bg-slate-100 px-2.5 py-1 rounded w-fit">
                      Admin
                    </span>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 text-sm font-semibold bg-gov-purple text-white rounded-lg"
                    >
                      Admin Dashboard
                    </Link>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="flex items-center text-rose-600 font-semibold text-sm pt-2 border-t border-slate-100 w-full"
                >
                  <LogOut size={16} className="mr-1.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-sm font-bold bg-gov-green text-white rounded-lg shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
