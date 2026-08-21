import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STATES_LIST } from '../../data/users';
import { CheckSquare, Mail, Lock, AlertCircle, ArrowRight, User, MapPin } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword || !state || !district) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!terms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = register(email, password, name, state, district);
      setLoading(false);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError('Registration failed. Try again.');
      }
    }, 800);
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
          <h2 className="mt-2 text-xl font-bold text-gov-dark tracking-tight">
            Create your citizen profile
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-gov-green hover:underline">
              Sign in here
            </Link>
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
            {/* Full Name */}
            <Input
              label="Full Name"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Rajesh Kumar"
              icon={User}
              required
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450"
            />

            {/* Email Address */}
            <Input
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              icon={Mail}
              required
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450"
            />

            {/* State & District Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* State Select */}
              <div className="text-left">
                <label htmlFor="state" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  State of Residence
                </label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-gov-purple text-xs h-[42px]"
                >
                  {STATES_LIST.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* District Input */}
              <div className="text-left">
                <label htmlFor="district" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  District
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <input
                    id="district"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="E.g. Pune"
                    required
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-purple text-xs h-[42px]"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              icon={Lock}
              required
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              icon={Lock}
              required
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-450"
            />
          </div>

          <div className="flex items-start text-xs text-slate-500 text-left">
            <input
              id="terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="h-4 w-4 text-gov-green focus:ring-gov-green border-slate-200 rounded cursor-pointer mt-0.5"
            />
            <label htmlFor="terms" className="ml-2 select-none cursor-pointer font-medium leading-relaxed">
              I agree to the terms of service and demographic parsing.
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              disabled={loading}
              variant="secondary"
              className="w-full py-3 bg-gov-purple hover:bg-gov-purple-dark text-white font-bold"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <div className="flex items-center justify-center space-x-1.5 w-full">
                  <span>Create Account</span>
                  <ArrowRight size={14} />
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
