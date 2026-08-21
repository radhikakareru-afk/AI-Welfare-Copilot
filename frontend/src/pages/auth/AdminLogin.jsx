import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CheckSquare, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (res.success && res.user.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Invalid administrator credentials. Access is restricted to system administrators.');
      }
    }, 800);
  };

  const handleQuickFill = () => {
    setEmail('admin@welfare.gov.in');
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full space-y-8 glass-dark p-8 rounded-2xl border border-slate-800 shadow-2xl relative z-10">
        
        {/* Header Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/10">
              <Shield size={22} className="stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              AI Welfare <span className="text-gov-purple-light text-purple-400">Admin</span>
            </span>
          </Link>
          <h2 className="mt-2 text-xl font-bold text-slate-200 tracking-tight">
            Administrator Login
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Secure access to the Welfare Copilot monitoring console.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-3 rounded-lg flex items-start space-x-2 text-xs text-left">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <Input
              label="Admin Email Address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@welfare.gov.in"
              icon={Mail}
              required
              className="bg-slate-950/40 border-slate-800 text-white placeholder-slate-500 focus:ring-gov-purple"
            />

            {/* Password Field */}
            <div className="text-left relative">
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2.5 border border-slate-800 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:border-transparent text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
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
                className="h-4 w-4 text-gov-purple focus:ring-gov-purple border-slate-800 bg-slate-900 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-slate-400">
                Remember me
              </label>
            </div>

            <div>
              <Link to="/forgot-password" className="font-semibold text-gov-purple hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit button */}
          <div>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3 bg-gov-purple hover:bg-gov-purple-dark text-white font-bold"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <div className="flex items-center justify-center space-x-2 w-full">
                  <span>Login to Console</span>
                  <ArrowRight size={16} />
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Quick Testing helper panel */}
        <div className="pt-6 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-center mb-3">
            Quick Fill Admin Account
          </span>
          <button
            type="button"
            onClick={handleQuickFill}
            className="w-full py-2 px-3 bg-slate-800/50 border border-slate-800 text-slate-350 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-xs font-semibold"
          >
            Admin Account
          </button>
        </div>
      </div>
    </div>
  );
}
