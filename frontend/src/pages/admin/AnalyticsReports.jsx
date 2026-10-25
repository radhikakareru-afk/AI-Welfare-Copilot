import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { MOCK_ANALYTICS } from '../../data/analytics';
import { TrendingUp, BarChart2, PieChart, Map, Award } from 'lucide-react';

export default function AnalyticsReports() {
  const { user: admin } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!admin) return;
    api.getAdminStats(admin.id)
      .then(res => {
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      })
      .catch(err => console.error('Error fetching analytics reports stats:', err));
  }, [admin]);

  const analytics = MOCK_ANALYTICS;

  const popularCategories = (stats && stats.categoryBreakdown && stats.categoryBreakdown.length > 0)
    ? stats.categoryBreakdown.map(c => ({
        name: c.name,
        percentage: stats.totalSchemes > 0 ? Math.round((c.scheme_count / stats.totalSchemes) * 100) : 0
      }))
    : analytics.popularCategories;

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <TrendingUp size={28} className="text-gov-purple" />
          <span>System Analytics & Reports</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Auditing citizen profiles, regional distributions, and catalog interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Popular Categories Pie Chart alternative */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-extrabold text-sm text-gov-dark border-b border-slate-100 pb-3 inline-flex items-center space-x-2">
            <PieChart size={16} className="text-gov-purple" />
            <span>Category Distribution</span>
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            {popularCategories.map((c, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-700">{c.name}</span>
                  <span className="text-gov-purple font-bold">{c.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-purple h-2 rounded-full"
                    style={{ width: `${c.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Registrations Map alternative */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-extrabold text-sm text-gov-dark border-b border-slate-100 pb-3 inline-flex items-center space-x-2">
            <Map size={16} className="text-gov-green" />
            <span>State Registration Distribution</span>
          </h3>

          <div className="space-y-3.5 text-xs text-slate-500">
            {analytics.usersByState.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="font-semibold text-slate-700">{s.state}</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  {s.count.toLocaleString()} Users
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Viewed Schemes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6 md:col-span-2">
          <h3 className="font-extrabold text-sm text-gov-dark border-b border-slate-100 pb-3 inline-flex items-center space-x-2">
            <BarChart2 size={16} className="text-gov-purple" />
            <span>Top Welfare Schemes Interaction Traffic</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-500">
            {/* Views list */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Most Visited</span>
              {analytics.mostViewedSchemes.map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-slate-700 max-w-[170px] truncate">{s.name}</span>
                  <span className="font-bold text-slate-800 shrink-0">{s.views.toLocaleString()} hits</span>
                </div>
              ))}
            </div>

            {/* Favorites list */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Most Favorited</span>
              {analytics.mostFavoritedSchemes.map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-slate-700 max-w-[170px] truncate">{s.name}</span>
                  <span className="font-bold text-slate-800 shrink-0">{s.count.toLocaleString()} saves</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
