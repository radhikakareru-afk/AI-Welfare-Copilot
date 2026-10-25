import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  CheckSquare, 
  Search, 
  FileText, 
  UserCheck, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getPublicStatistics()
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setStats(res.data);
          setError(null);
        } else {
          setError(res.error || 'Failed to load statistics');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Error fetching public statistics:', err);
        setError('Database statistics temporarily unavailable');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white min-h-screen relative overflow-hidden font-sans">
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-slate-900 text-white">
        {/* Glow decoration */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 mb-6 text-xs text-gov-green font-bold uppercase tracking-wider">
            <Zap size={12} className="fill-current" />
            <span>AI-Driven Eligibility Mapping</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto font-sans">
            Find Government Schemes <br />
            You Are <span className="text-gov-green">Eligible For.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            One centralized engine. Stop navigating complex portals. Fill your citizen profile once, discover active central & state benefits instantly, and receive complete step-by-step guides.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to={user ? "/profile" : "/register"}
              className="w-full sm:w-auto px-8 py-4 bg-gov-green hover:bg-gov-green-dark text-white font-bold rounded-xl hover-lift transition-all inline-flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10"
            >
              <span>Check Your Eligibility</span>
              <ArrowRight size={18} />
            </Link>
            
            <Link
              to="/schemes"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300 font-bold rounded-xl hover-lift transition-all inline-flex items-center justify-center space-x-1.5"
            >
              <Search size={16} />
              <span>Browse Schemes</span>
            </Link>
          </div>

          {/* Quick stats banner */}
          <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            <div>
              {loading ? (
                <span className="block text-3xl font-extrabold text-slate-500 animate-pulse">—</span>
              ) : error ? (
                <span className="block text-3xl font-extrabold text-slate-400" title="Statistics unavailable">—</span>
              ) : (
                <span className="block text-3xl font-extrabold text-white">
                  {stats?.schemes?.formatted || '0'}
                </span>
              )}
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stats?.schemes?.label || 'Welfare Schemes'}
              </span>
            </div>
            <div>
              {loading ? (
                <span className="block text-3xl font-extrabold text-slate-500 animate-pulse">—</span>
              ) : error ? (
                <span className="block text-3xl font-extrabold text-slate-400" title="Statistics unavailable">—</span>
              ) : (
                <span className="block text-3xl font-extrabold text-white">
                  {stats?.states?.formatted || '0'}
                </span>
              )}
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stats?.states?.label || 'States Supported'}
              </span>
            </div>
            <div>
              {loading ? (
                <span className="block text-3xl font-extrabold text-slate-500 animate-pulse">—</span>
              ) : error ? (
                <span className="block text-3xl font-extrabold text-slate-400" title="Statistics unavailable">—</span>
              ) : (
                <span className="block text-3xl font-extrabold text-white">
                  {stats?.citizens?.formatted || '0'}
                </span>
              )}
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stats?.citizens?.label || 'Registered Users'}
              </span>
            </div>
            <div>
              {loading ? (
                <span className="block text-3xl font-extrabold text-slate-500 animate-pulse">—</span>
              ) : error ? (
                <span className="block text-3xl font-extrabold text-slate-400" title="Statistics unavailable">—</span>
              ) : (
                <span className="block text-3xl font-extrabold text-white">
                  {stats?.synchronization?.formatted || 'Standby'}
                </span>
              )}
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stats?.synchronization?.label || 'Auto-Synchronized'}
              </span>
            </div>
          </div>
          {error && !loading && (
            <p className="mt-4 text-[11px] text-slate-400 text-center font-medium">
              Live database statistics temporarily unavailable.
            </p>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-gov-dark font-sans">
            How It Works
          </h2>
          <p className="mt-4 text-slate-500">
            We map eligibility attributes dynamically against complex rules so you can bypass government bureaucracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 hover-lift relative transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-gov-green-light text-gov-green flex items-center justify-center mb-6">
              <UserCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-gov-dark mb-2">1. Create Profile</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Enter basic details like age, location, occupation, caste, and annual income securely.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 hover-lift relative transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-gov-purple-light text-gov-purple flex items-center justify-center mb-6">
              <CheckSquare size={24} />
            </div>
            <h3 className="text-lg font-bold text-gov-dark mb-2">2. Get Matches</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Our eligibility engine scans active criteria and groups schemes by qualification status.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-slate-100 hover-lift relative transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-gov-dark mb-2">3. Apply Guided</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Follow step-by-step filing steps, document checklist verification, and portal directions.
            </p>
          </div>
        </div>
      </section>

      {/* Key features / Trust Highlights */}
      <section className="bg-slate-50 py-16 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <h2 className="text-3xl font-extrabold text-gov-dark font-sans leading-tight">
              Real-time synchronization with government sources
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Rules and deadlines change regularly. Our platform operates a Synchronization Service that checks official sources daily, detecting new schemes and updating application deadlines automatically.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-slate-700 font-semibold">
                <ShieldCheck size={18} className="text-gov-green" />
                <span>Verified Machine-Readable Sources</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-700 font-semibold">
                <Globe size={18} className="text-gov-purple" />
                <span>Supports Central & State Specific Portals</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-4 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sync Log Activity</span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full">ACTIVE</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
                <span className="font-bold text-gov-dark">Central MyScheme Provider</span>
                <span className="text-slate-500">Updated 15m ago (+2 schemes)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
                <span className="font-bold text-gov-dark">Maharashtra DB API</span>
                <span className="text-slate-500">Updated 2h ago (deadlines adjusted)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-gov-dark">FAQ Preview</h2>
          <p className="text-slate-500 text-xs mt-2">Get answers to the most common questions about welfare checking.</p>
        </div>
        <div className="space-y-4 text-left text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
            <h4 className="font-bold text-slate-800 mb-2">How does the eligibility checker evaluate my profile?</h4>
            <p className="text-slate-500 leading-relaxed">It matches personal details such as age, location, category, and occupation directly against rules synced from government databases.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
            <h4 className="font-bold text-slate-800 mb-2">Do you submit the application to government websites directly?</h4>
            <p className="text-slate-500 leading-relaxed">No, we provide step-by-step instructions and redirect you to the official official portal page to complete security verification and biometrics.</p>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link to="/faq" className="text-xs font-bold text-gov-green hover:text-gov-green-dark inline-flex items-center space-x-1">
            <span>View All FAQs</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4 border-t border-slate-100">
        <h2 className="text-3xl font-extrabold text-gov-dark font-sans mb-4">
          Ready to discover your benefits?
        </h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">
          Sign up today, fill out your demographic details, and let our engine calculate exactly what you qualify for.
        </p>
        <Link
          to={user ? "/profile" : "/register"}
          className="px-8 py-4 bg-gov-purple hover:bg-gov-purple-dark text-white font-bold rounded-xl hover-lift transition-all inline-flex items-center space-x-2 shadow-lg shadow-purple-500/10"
        >
          <span>Get Started Free</span>
          <ArrowRight size={18} />
        </Link>
      </section>
      
    </div>
  );
}
