import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, CheckSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-left">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full space-y-8 glass-dark p-8 rounded-2xl border border-slate-800 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-green flex items-center justify-center text-white font-bold">
              <CheckSquare size={22} className="stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              AI Welfare <span className="text-gov-purple-light text-purple-400">Copilot</span>
            </span>
          </Link>
          <h2 className="mt-2 text-xl font-bold text-slate-200 tracking-tight">
            Forgot Password
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
            Provide your email address and we'll dispatch a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-4 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <CheckCircle2 size={16} className="text-gov-green" />
              <span>Instructions Dispatched</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a password reset link will arrive in a few minutes.
            </p>
            <div className="pt-2 text-center">
              <Link to="/login" className="text-xs font-bold text-gov-green hover:underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E.g. citizen@welfare.gov.in"
              icon={Mail}
              required
              className="bg-slate-950/40 border-slate-800 text-white placeholder-slate-500"
            />

            <div>
              <Button type="submit" variant="primary" className="w-full py-3 bg-gov-green hover:bg-gov-green-dark">
                <span>Send Reset Link</span>
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-white">
                <ArrowLeft size={12} />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
