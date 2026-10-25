import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STATES_LIST } from '../../data/users';
import api from '../../services/api';
import { 
  CheckSquare, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  User, 
  MapPin, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw, 
  Send 
} from 'lucide-react';
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

  // Email OTP Verification state
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async () => {
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.requestOtp(email);
      setOtpLoading(false);
      if (res.success) {
        setIsOtpSent(true);
        setIsDemoMode(Boolean(res.is_demo_mode));
        setCooldown(res.cooldown_seconds || 60);
        setSuccessMsg(res.message);
      } else {
        setError(res.message || 'Failed to send verification code.');
        if (res.cooldown_remaining) {
          setCooldown(res.cooldown_remaining);
        }
      }
    } catch (err) {
      setOtpLoading(false);
      const errMsg = (err.data && err.data.message) || err.message || 'Failed to send verification code. Please check connection.';
      setError(errMsg);
      if (err.data && err.data.cooldown_remaining) {
        setCooldown(err.data.cooldown_remaining);
      }
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setSuccessMsg('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setOtpVerifyLoading(true);
    try {
      const res = await api.verifyOtp(email, otp.trim());
      setOtpVerifyLoading(false);
      if (res.success) {
        setIsEmailVerified(true);
        setVerificationToken(res.verification_token);
        setSuccessMsg('Email verified successfully! You can now complete your registration.');
      } else {
        setError(res.message || 'Invalid verification code.');
      }
    } catch (err) {
      setOtpVerifyLoading(false);
      setError(err.message || 'Failed to verify code. Please check your connection.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name || !email || !password || !confirmPassword || !state || !district) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isEmailVerified) {
      setError('Please verify your email address with the OTP sent to your inbox before proceeding.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!terms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(email, password, name, state, district, verificationToken);
      setLoading(false);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed. Please check your connection.');
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

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-start space-x-2 text-xs">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

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

            {/* Email Address with Verification Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                {isEmailVerified && (
                  <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 size={12} />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled={isEmailVerified || isOtpSent}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className={`block w-full pl-9 pr-3 py-2.5 border rounded-xl text-xs h-[42px] transition-all ${
                      isEmailVerified 
                        ? 'bg-slate-100 border-emerald-300 text-slate-600 cursor-not-allowed'
                        : isOtpSent
                        ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-gov-purple'
                    }`}
                  />
                </div>
                {!isEmailVerified && (
                  <button
                    type="button"
                    disabled={otpLoading || (isOtpSent && cooldown > 0)}
                    onClick={handleRequestOtp}
                    className="px-3.5 h-[42px] bg-gov-green hover:bg-gov-green-dark text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {otpLoading ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>
                      {isOtpSent 
                        ? (cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend OTP') 
                        : 'Send OTP'}
                    </span>
                  </button>
                )}
              </div>
              {!isEmailVerified && !isOtpSent && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Click "Send OTP" to receive a verification code on your email.
                </p>
              )}
            </div>

            {/* OTP Input & Verify Panel */}
            {isOtpSent && !isEmailVerified && (
              <div className="p-3.5 bg-slate-50 border border-gov-purple/20 rounded-xl space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label htmlFor="otp" className="block text-xs font-bold text-slate-600">
                    Enter 6-Digit Verification Code
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {isDemoMode ? (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Demo Mode Active
                      </span>
                    ) : (
                      <>Dispatched to <strong className="text-slate-600">{email}</strong></>
                    )}
                  </span>
                </div>

                {isDemoMode && (
                  <div className="bg-amber-50/90 border border-amber-200 text-amber-800 px-3 py-2 rounded-xl text-xs flex items-start space-x-2">
                    <span className="font-bold shrink-0">Terminal OTP:</span>
                    <span>Check your running Flask backend terminal for the 6-digit code.</span>
                  </div>
                )}

                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound size={16} />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 font-mono tracking-widest text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gov-purple h-[40px]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={otpVerifyLoading || otp.length !== 6}
                    onClick={handleVerifyOtp}
                    className="px-4 h-[40px] bg-gov-purple hover:bg-gov-purple-dark text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {otpVerifyLoading ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    <span>Verify Code</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Code expires in 5 minutes</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setIsDemoMode(false);
                      setOtp('');
                    }}
                    className="text-gov-purple hover:underline font-semibold"
                  >
                    Change Email
                  </button>
                </div>
                {!isDemoMode && (
                  <p className="text-[11px] text-slate-400 pt-0.5 border-t border-slate-100">
                    Didn't receive the email? Check your spam folder or verify the email address was typed correctly.
                  </p>
                )}
              </div>
            )}

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
              minLength={6}
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
              minLength={6}
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
              disabled={loading || !isEmailVerified}
              variant="secondary"
              className={`w-full py-3 text-white font-bold transition-all ${
                isEmailVerified 
                  ? 'bg-gov-purple hover:bg-gov-purple-dark' 
                  : 'bg-slate-300 cursor-not-allowed hover:bg-slate-300 text-slate-500'
              }`}
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <div className="flex items-center justify-center space-x-1.5 w-full">
                  <span>{isEmailVerified ? 'Create Account' : 'Verify Email to Register'}</span>
                  <ArrowRight size={14} />
                </div>
              )}
            </Button>
            {!isEmailVerified && (
              <p className="mt-1.5 text-center text-[11px] text-slate-400">
                You must verify your email address before creating your account.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
