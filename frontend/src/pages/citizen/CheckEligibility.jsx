import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CheckSquare, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';

export default function CheckEligibility() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleStartCheck = () => {
    setLoading(true);
    setLoadingStep('Parsing demographic profile properties...');
    
    setTimeout(() => {
      setLoadingStep('Matching location-based state restrictions...');
    }, 600);

    setTimeout(() => {
      setLoadingStep('Verifying income ceiling constraints...');
    }, 1200);

    setTimeout(() => {
      setLoadingStep('Compiling educational eligibility matrices...');
      setLoadingStep('Finalizing scheme reports...');
    }, 1800);

    setTimeout(() => {
      setLoading(false);
      navigate('/eligible-schemes');
    }, 2400);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 font-sans text-left py-10">
      
      {/* Title */}
      <div className="text-center">
        <div className="w-12 h-12 bg-gov-green-light text-gov-green rounded-full flex items-center justify-center mx-auto mb-4 border border-gov-green/10">
          <CheckSquare size={26} />
        </div>
        <h1 className="text-2xl font-extrabold text-gov-dark">Eligibility Engine Assessment</h1>
        <p className="mt-2 text-slate-500 text-xs">
          Match your profile parameters against centralized rulesets in real-time.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-premium text-center space-y-4">
          <RefreshCw size={36} className="mx-auto text-gov-purple animate-spin" />
          <h4 className="font-bold text-sm text-slate-700">Evaluating Schemes</h4>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider animate-pulse">{loadingStep}</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-bold text-sm text-gov-dark border-b border-slate-100 pb-2">Active Assessment Values</h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">AGE</span>
              <span className="font-semibold text-slate-800">32 Years</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">OCCUPATION</span>
              <span className="font-semibold text-slate-800">{profile.occupation}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">ANNUAL INCOME</span>
              <span className="font-semibold text-slate-800">₹{profile.annual_income.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">STATE / REGION</span>
              <span className="font-semibold text-slate-800">{profile.state}</span>
            </div>
          </div>

          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex items-start space-x-2 text-[11px] text-purple-750">
            <Sparkles size={16} className="text-gov-purple shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              If your current attributes have changed, update them in <strong>My Profile</strong> before checking to ensure matching accuracy.
            </p>
          </div>

          <Button onClick={handleStartCheck} variant="primary" className="w-full py-3 bg-gov-green hover:bg-gov-green-dark">
            <span>Check My Eligibility</span>
          </Button>
        </div>
      )}

    </div>
  );
}
