import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CheckSquare, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, User, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      
      if (res.success) {
        if (activeTab === 'admin' && res.user.role === 'admin') {
          navigate('/admin');
        } else if (activeTab === 'citizen' && res.user.role === 'citizen') {
          navigate('/dashboard');
        } else {
          // Cross role mismatch (e.g. logging in with admin credentials under citizen tab or vice-versa)
          if (activeTab === 'citizen') {
            setError('Invalid citizen email or password.');
          } else {
            setError('Invalid admin email or password.');
          }
        }
      } else {
        if (activeTab === 'citizen') {
          setError('Invalid citizen email or password.');
        } else {
          setError('Invalid admin email or password.');
        }
      }
    }, 800);
  };

  const handleQuickFill = () => {
    if (activeTab === 'citizen') {
      setEmail('citizen@demo.com');
      setPassword('Citizen@123');
    } else {
      setEmail('admin@demo.com');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background light gradient effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-gov-green-light rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-gov-purple-light rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-premium relative z-10 text-left">
        
        {/* Header Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-mixed flex items-center justify-center text-white font-bold shadow-md">
              <CheckSquare size={22} className="stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gov-dark">
              AI Welfare <span className="text-gov-purple">Copilot</span>
            </span>
          </Link>
          
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">
            Demo Welfare Platform
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('citizen')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'citizen'
                ? 'bg-white text-gov-green shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User size={14} />
            <span>Citizen Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-gov-purple shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield size={14} />
            <span>Admin Console</span>
          </button>
        </div>

        {/* Dynamic Titles */}
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-gov-dark tracking-tight">
            {activeTab === 'citizen' ? 'Citizen Login' : 'Admin Login'}
          </h2>
          <p className="mt-1 text-xs text-slate-505 text-slate-500">
            {activeTab === 'citizen' 
              ? 'Login to discover government schemes you\'re eligible for.' 
              : 'Login to monitor the Welfare Copilot platform.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start space-x-2 text-xs">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <Input
              label={activeTab === 'citizen' ? 'Email Address' : 'Admin Email'}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeTab === 'citizen' ? 'name@example.com' : 'admin@demo.com'}
              icon={Mail}
              required
              className="bg-slate-50 border-slate-200 text-slate-800 focus:ring-2 focus:ring-gov-purple"
            />

            {/* Password Field */}
            <div className="text-left relative">
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:border-transparent text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-gov-purple focus:ring-gov-purple border-slate-200 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-slate-500 font-medium select-none cursor-pointer">
                Remember me
              </label>
            </div>

            <div>
              <Link to="/forgot-password" className="font-bold text-gov-purple hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className={`w-full py-3 text-white font-bold transition-all ${
                activeTab === 'citizen' 
                  ? 'bg-gov-green hover:bg-gov-green-dark' 
                  : 'bg-gov-purple hover:bg-gov-purple-dark'
              }`}
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <div className="flex items-center justify-center space-x-1.5 w-full">
                  <span>{activeTab === 'citizen' ? 'Login as Citizen' : 'Login as Admin'}</span>
                  <ArrowRight size={14} />
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Extra Navigation Helper */}
        {activeTab === 'citizen' && (
          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-gov-green hover:underline">
              Register
            </Link>
          </div>
        )}

        {/* Demo filler helper panel */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block text-center mb-2.5">
            Quick Fill Demo Credentials
          </span>
          <button
            type="button"
            onClick={handleQuickFill}
            className={`w-full py-2 px-3 border rounded-xl transition-all text-xs font-semibold ${
              activeTab === 'citizen'
                ? 'bg-gov-green-light border-gov-green/10 text-gov-green hover:bg-gov-green/10'
                : 'bg-gov-purple-light border-gov-purple/10 text-gov-purple hover:bg-gov-purple/10'
            }`}
          >
            {activeTab === 'citizen' ? 'Fill Citizen Demo' : 'Fill Admin Demo'}
          </button>
        </div>

      </div>
    </div>
  );
}
