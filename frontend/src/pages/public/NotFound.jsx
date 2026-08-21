import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full glass-dark p-8 rounded-2xl border border-slate-800 shadow-2xl text-center space-y-6 relative z-10">
        
        {/* Shield Indicator */}
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <ShieldAlert size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white">404</h1>
          <h3 className="text-lg font-bold text-slate-200">Page Not Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            The path you are looking for does not exist, or you might have traversed an unmapped workspace.
          </p>
        </div>

        <div className="flex space-x-3 justify-center pt-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="border-slate-800 text-slate-300 hover:bg-slate-800">
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </Button>
          <Link to="/" className="inline-block">
            <Button variant="primary">
              <Home size={14} />
              <span>Go Home</span>
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
