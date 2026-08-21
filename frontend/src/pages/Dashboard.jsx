import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { mockSchemes } from '../utils/mockSchemes';
import { evaluateEligibility } from '../utils/eligibilityEngine';
import { 
  User, 
  Bookmark, 
  Bell, 
  CheckSquare, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  GitCompare,
  TrendingUp,
  Cpu,
  Layers,
  Heart
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, favorites, recentlyViewed } = useAuth();
  const { notifications } = useNotifications();

  // ---------------- CITIZEN COMPUTATIONS ----------------
  const citizenEligibleCount = useMemo(() => {
    if (user?.role !== 'citizen') return 0;
    return mockSchemes.filter(scheme => {
      const { status } = evaluateEligibility(profile, scheme);
      return status === 'eligible';
    }).length;
  }, [profile, user]);

  const citizenPartiallyCount = useMemo(() => {
    if (user?.role !== 'citizen') return 0;
    return mockSchemes.filter(scheme => {
      const { status } = evaluateEligibility(profile, scheme);
      return status === 'partially_eligible';
    }).length;
  }, [profile, user]);

  const bookmarkedSchemes = useMemo(() => {
    if (user?.role !== 'citizen') return [];
    return mockSchemes.filter(s => favorites.includes(s.id));
  }, [favorites, user]);

  const recentlyViewedSchemes = useMemo(() => {
    if (user?.role !== 'citizen') return [];
    return mockSchemes.filter(s => recentlyViewed.includes(s.id));
  }, [recentlyViewed, user]);

  // Deadlines calculations
  const upcomingDeadlines = useMemo(() => {
    return mockSchemes
      .filter(s => s.application_deadline)
      .map(s => ({
        id: s.id,
        name: s.name,
        date: new Date(s.application_deadline)
      }))
      .sort((a, b) => a.date - b.date)
      .slice(0, 3);
  }, []);

  // ---------------- ADMIN PANEL DETAILS ----------------
  const mockProviders = [
    { name: 'MyScheme Central Portal', type: 'REST API', status: 'Healthy', last_run: '15m ago', speed: '98ms' },
    { name: 'Maharashtra Agriculture Node', type: 'JSON Stream', status: 'Healthy', last_run: '2h ago', speed: '142ms' },
    { name: 'Karnataka DBT Integrator', type: 'SOAP Wrapper', status: 'Syncing', last_run: 'Just now', speed: '210ms' },
    { name: 'National Scholarship Gateway', type: 'CSV Parser', status: 'Offline', last_run: '1d ago', speed: '-' }
  ];

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-premium text-white p-8 rounded-2xl border border-slate-800 shadow-xl mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4">
        {/* Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[30%] h-[50%] bg-orange-500/10 rounded-full blur-[100px]"></div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-gov-saffron/20 text-gov-saffron px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="fill-current" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
            {user.role === 'admin' ? 'System Administrator Console' : `Namaste, ${profile.full_name}`}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            {user.role === 'admin' 
              ? 'Real-time telemetry of synchronization nodes, database clusters, and API nodes.'
              : 'Automatically parsing eligibility requirements for Central & State welfare programs.'}
          </p>
        </div>

        <div className="flex space-x-2 shrink-0">
          {user.role === 'citizen' ? (
            <Link
              to="/profile"
              className="px-4 py-2.5 bg-gradient-saffron text-white font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all hover-lift"
            >
              Update Demographics
            </Link>
          ) : (
            <Link
              to="/admin/sync"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all inline-flex items-center space-x-1.5"
            >
              <RefreshCw size={12} className="animate-spin-slow" />
              <span>Trigger Sync Portal</span>
            </Link>
          )}
        </div>
      </div>

      {/* ================== CITIZEN VIEW ================== */}
      {user.role === 'citizen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns (Profile + Matches) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Eligible Payouts */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fully Eligible</span>
                  <span className="text-3xl font-extrabold text-gov-green block mt-1">{citizenEligibleCount}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Schemes qualified</span>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-gov-green shrink-0">
                  <CheckSquare size={22} />
                </div>
              </div>

              {/* Partially Eligible */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Partially Eligible</span>
                  <span className="text-3xl font-extrabold text-gov-saffron block mt-1">{citizenPartiallyCount}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Missing documents</span>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-gov-saffron shrink-0">
                  <ShieldAlert size={22} />
                </div>
              </div>

              {/* Bookmarks */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bookmarks</span>
                  <span className="text-3xl font-extrabold text-gov-blue block mt-1">{bookmarkedSchemes.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Saved programs</span>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-gov-blue shrink-0">
                  <Bookmark size={22} />
                </div>
              </div>
            </div>

            {/* Profile Parameters Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
              <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <User size={18} className="text-gov-saffron" />
                <span>Eligibility Engine Profile Matrix</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">OCCUPATION</span>
                  <span className="font-bold text-slate-800">{profile.occupation}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">ANNUAL INCOME</span>
                  <span className="font-bold text-slate-800">₹{profile.annual_income.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">STATE OF ORIGIN</span>
                  <span className="font-bold text-slate-800">{profile.state}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">CASTE CATEGORY</span>
                  <span className="font-bold text-slate-800">{profile.category}</span>
                </div>
              </div>
            </div>

            {/* Saved Bookmarked Schemes summary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
              <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <Bookmark size={18} className="text-gov-saffron" />
                <span>Saved Bookmarks</span>
              </h3>

              {bookmarkedSchemes.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {bookmarkedSchemes.slice(0, 3).map((scheme) => (
                    <div key={scheme.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">{scheme.name}</h4>
                        <span className="text-[10px] text-slate-400">{scheme.category}</span>
                      </div>
                      <Link
                        to={`/schemes/${scheme.id}`}
                        className="text-gov-saffron hover:underline font-bold inline-flex items-center space-x-1 shrink-0"
                      >
                        <span>View Guide</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
                  {bookmarkedSchemes.length > 3 && (
                    <div className="pt-3 text-center">
                      <Link to="/favorites" className="text-xs font-bold text-slate-500 hover:text-gov-saffron">
                        View all saved schemes ({bookmarkedSchemes.length})
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  You haven't bookmarked any schemes yet. Go to the <Link to="/schemes" className="text-gov-saffron hover:underline font-semibold">Catalog</Link> to search.
                </p>
              )}
            </div>

          </div>

          {/* Right Sidebar (Deadlines, Recent Views, Notifications) */}
          <div className="space-y-8">
            
            {/* Deadlines Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
              <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <Calendar size={18} className="text-gov-saffron" />
                <span>Upcoming Deadlines</span>
              </h3>

              <div className="space-y-4 text-xs">
                {upcomingDeadlines.map((scheme) => (
                  <div key={scheme.id} className="flex justify-between items-center bg-rose-50/30 border border-rose-100/60 p-3 rounded-xl">
                    <div className="text-left pr-3">
                      <h4 className="font-bold text-slate-800 truncate max-w-[130px]" title={scheme.name}>
                        {scheme.name}
                      </h4>
                      <span className="text-[9px] text-rose-600 font-bold block uppercase mt-0.5">Filing Deadline</span>
                    </div>
                    <span className="font-bold text-rose-600 bg-rose-100/80 px-2 py-1 rounded shrink-0">
                      {scheme.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Viewed Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
              <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <Clock size={18} className="text-gov-saffron" />
                <span>Recently Viewed</span>
              </h3>

              {recentlyViewedSchemes.length > 0 ? (
                <div className="space-y-3 text-xs">
                  {recentlyViewedSchemes.map((scheme) => (
                    <div key={scheme.id} className="flex justify-between items-center">
                      <div className="text-left">
                        <h4 className="font-bold text-slate-700 truncate max-w-[150px]">{scheme.name}</h4>
                        <span className="text-[10px] text-slate-400 block">{scheme.category}</span>
                      </div>
                      <Link to={`/schemes/${scheme.id}`} className="text-slate-400 hover:text-gov-saffron">
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2 text-center">No recently visited schemes.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================== ADMIN VIEW ================== */}
      {user.role === 'admin' && (
        <div className="space-y-8">
          
          {/* Admin Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Citizens</span>
                <span className="text-3xl font-extrabold text-gov-dark block mt-1">15,240</span>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                <User size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Schemes</span>
                <span className="text-3xl font-extrabold text-gov-dark block mt-1">142</span>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                <Layers size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduler Status</span>
                <span className="text-3xl font-extrabold text-gov-green block mt-1">Active</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-gov-green shrink-0">
                <Cpu size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Database Health</span>
                <span className="text-3xl font-extrabold text-gov-green block mt-1">99.9%</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-gov-green shrink-0">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 cols: Provider statuses & SVG Analytics */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Provider Nodes list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
                <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3 mb-6">
                  <Cpu size={18} className="text-gov-saffron" />
                  <span>External Government Synchronization Nodes</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px]">
                        <th className="pb-3">Provider Name</th>
                        <th className="pb-3">Protocol</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3 text-right font-medium">Last Sync Run</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockProviders.map((prov, i) => (
                        <tr key={i} className="text-slate-600">
                          <td className="py-3.5 font-bold text-gov-dark">{prov.name}</td>
                          <td className="py-3.5 font-medium">{prov.type}</td>
                          <td className="py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              prov.status === 'Healthy' 
                                ? 'bg-emerald-50 text-gov-green border border-emerald-100'
                                : prov.status === 'Syncing'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                              {prov.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-semibold text-slate-500">{prov.last_run}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytical registration SVG Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
                <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3 mb-6">
                  <TrendingUp size={18} className="text-gov-saffron" />
                  <span>Citizen Registrations & Sync Actions (Weekly)</span>
                </h3>

                {/* Simulated SVG Graph */}
                <div className="w-full h-48 bg-slate-50 rounded-xl p-4 flex items-end justify-between relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-6 px-10 text-[9px] text-slate-400 select-none">
                    <div className="border-b border-slate-200/50 w-full text-left">2,000 users</div>
                    <div className="border-b border-slate-200/50 w-full text-left">1,000 users</div>
                    <div className="w-full text-left">0 users</div>
                  </div>
                  
                  {/* SVG Line / Bars */}
                  <svg className="w-full h-full relative z-10" viewBox="0 0 500 150">
                    {/* Fill Area Gradient */}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <path
                      d="M 50 120 Q 120 70 200 85 T 350 40 T 450 30 L 450 140 L 50 140 Z"
                      fill="url(#chartGrad)"
                    />
                    {/* Line path */}
                    <path
                      d="M 50 120 Q 120 70 200 85 T 350 40 T 450 30"
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Data dots */}
                    <circle cx="50" cy="120" r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                    <circle cx="125" cy="85" r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                    <circle cx="200" cy="85" r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                    <circle cx="275" cy="55" r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                    <circle cx="350" cy="40" r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                    <circle cx="450" cy="30" r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                  </svg>

                  {/* X Axis Labels */}
                  <div className="absolute bottom-1 w-full flex justify-between px-10 text-[9px] text-slate-400 font-bold uppercase">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat/Sun</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right sidebar: Recent Logs summary */}
            <div className="space-y-8">
              
              {/* Sync logs telemetry preview */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-gov-dark">Recent Sync History</h3>
                  <Link to="/admin/sync" className="text-[10px] font-bold text-gov-saffron hover:underline">
                    Logs Center
                  </Link>
                </div>

                <div className="space-y-3 text-xs text-left">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>MyScheme Central Run</span>
                      <span className="text-gov-green">SUCCESS</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Added 2 schemes, updated 15. Execution time: 7.2s.</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Maharashtra API Node</span>
                      <span className="text-gov-green">SUCCESS</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Database matches current records. Execution time: 1.4s.</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>National Fellowship Node</span>
                      <span className="text-rose-600">FAILED</span>
                    </div>
                    <p className="text-[10px] text-rose-500 font-medium">Timeout response 504. Node rescheduled to run in 1h.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}
