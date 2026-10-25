import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { MOCK_ANALYTICS } from '../../data/analytics';
import { 
  Users, 
  Layers, 
  Cpu, 
  TrendingUp, 
  RefreshCw, 
  ArrowRight,
  Database
} from 'lucide-react';

export default function Dashboard() {
  const { user: admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) return;
    api.getAdminStats(admin.id)
      .then(res => {
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      })
      .catch(err => console.error('Error fetching admin dashboard stats:', err))
      .finally(() => setLoading(false));
  }, [admin]);

  const syncLogsSummary = (stats && stats.syncLogs && stats.syncLogs.length > 0)
    ? stats.syncLogs
    : MOCK_ANALYTICS.syncLogs;

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered Citizens"
          value={stats ? stats.totalCitizens.toLocaleString() : (loading ? "..." : "0")}
          subtitle="All active state mappings"
          icon={Users}
          variant="purple"
        />
        <StatCard
          title="Total Welfare Schemes"
          value={stats ? stats.totalSchemes.toLocaleString() : (loading ? "..." : "0")}
          subtitle="Auto-synchronized daily"
          icon={Layers}
          variant="purple"
        />
        <StatCard
          title="Scheduler Status"
          value={stats?.telemetry?.schedulerStatus || "Online"}
          subtitle="CRON runs at 00:00 UTC"
          icon={Cpu}
          variant="green"
        />
        <StatCard
          title="Database Telemetry"
          value={stats?.telemetry?.databaseStatus || "Operational"}
          subtitle="PostgreSQL status active"
          icon={Database}
          variant="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Analytics registrations SVG + Provider nodes) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* User Growth Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
            <h3 className="font-extrabold text-sm text-gov-dark border-b border-slate-100 pb-3 mb-6 inline-flex items-center space-x-2">
              <TrendingUp size={16} className="text-gov-purple" />
              <span>User Base Growth (Monthly)</span>
            </h3>

            {/* Custom Responsive SVG Chart */}
            <div className="w-full h-48 bg-slate-50 rounded-xl p-4 flex items-end justify-between relative text-slate-400">
              <div className="absolute inset-0 flex flex-col justify-between py-6 px-10 text-[9px] select-none border-slate-200/40">
                <div className="border-b border-slate-200/50 w-full">20,000 Users</div>
                <div className="border-b border-slate-200/50 w-full">10,000 Users</div>
                <div>0 Users</div>
              </div>

              <svg className="w-full h-full relative z-10" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M 50 120 Q 120 70 200 85 T 350 40 T 450 30 L 450 140 L 50 140 Z"
                  fill="url(#purpleGrad)"
                />
                <path
                  d="M 50 120 Q 120 70 200 85 T 350 40 T 450 30"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="120" r="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                <circle cx="130" cy="80" r="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                <circle cx="210" cy="85" r="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                <circle cx="290" cy="55" r="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                <circle cx="370" cy="40" r="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                <circle cx="450" cy="30" r="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
              </svg>

              <div className="absolute bottom-1 w-full flex justify-between px-10 text-[9px] font-bold uppercase select-none">
                {MOCK_ANALYTICS.userGrowth.map((g, idx) => (
                  <span key={idx}>{g.month}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sync History Logs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
            <h3 className="font-extrabold text-sm text-gov-dark border-b border-slate-100 pb-3 mb-6 flex justify-between items-center">
              <span className="inline-flex items-center space-x-2">
                <RefreshCw size={16} className="text-gov-green" />
                <span>Recent Sync Operations</span>
              </span>
              <RouterLink to="/admin/synchronization/logs" className="text-[10px] font-bold text-gov-purple hover:underline">
                Logs Center
              </RouterLink>
            </h3>

            <div className="space-y-4">
              {syncLogsSummary.slice(0, 2).map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{log.provider}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right sidebar: Quick Actions & Status */}
        <div className="space-y-8">
          
          {/* Quick links & actions */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-white">Monitoring Actions</h3>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Synchronization is automated, but administrators can force queries manually.
            </p>
            <RouterLink
              to="/admin/synchronization"
              className="w-full py-2.5 bg-gov-purple hover:bg-gov-purple-dark text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Sync Monitor Panel</span>
              <ArrowRight size={12} />
            </RouterLink>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-4 text-xs text-slate-500">
            <h4 className="font-bold text-gov-dark border-b border-slate-100 pb-2">Active Telemetry Channels</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">MyScheme Provider</span>
                <span className="text-gov-green font-bold">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Maharashtra State DB</span>
                <span className="text-gov-green font-bold">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">UGC Scholarship DB</span>
                <span className="text-gov-purple font-bold">Syncing</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
