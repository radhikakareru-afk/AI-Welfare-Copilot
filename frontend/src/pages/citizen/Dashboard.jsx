import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { evaluateEligibility } from '../../utils/eligibilityEngine';
import StatCard from '../../components/common/StatCard';
import api from '../../services/api';
import { 
  Bookmark, 
  Bell, 
  CheckSquare, 
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, favorites, recentlyViewed } = useAuth();
  const { notifications } = useNotifications();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load schemes from API
  useEffect(() => {
    setLoading(true);
    api.getSchemes()
      .then(res => {
        if (res.success && res.schemes) {
          setSchemes(res.schemes);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard scheme loading error:', err);
        setLoading(false);
      });
  }, []);

  // Citizen Computations
  const eligibleSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const { status } = evaluateEligibility(profile, scheme);
      return status === 'eligible';
    });
  }, [schemes, profile]);

  const partiallyEligibleCount = useMemo(() => {
    return schemes.filter(scheme => {
      const { status } = evaluateEligibility(profile, scheme);
      return status === 'partially_eligible';
    }).length;
  }, [schemes, profile]);

  const bookmarkedSchemes = useMemo(() => {
    return schemes.filter(s => favorites.includes(String(s.id)));
  }, [schemes, favorites]);

  const recentlyViewedSchemes = useMemo(() => {
    return schemes.filter(s => recentlyViewed.includes(String(s.id)));
  }, [schemes, recentlyViewed]);

  const upcomingDeadlines = useMemo(() => {
    return schemes
      .filter(s => s.application_deadline)
      .map(s => ({
        id: s.id,
        name: s.name,
        date: new Date(s.application_deadline)
      }))
      .sort((a, b) => a.date - b.date)
      .slice(0, 3);
  }, [schemes]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <div className="w-12 h-12 border-4 border-gov-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Recalibrating citizen metrics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Welcome & Profile completion indicator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1 bg-gov-green-light text-gov-green-dark px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={10} className="fill-current" />
            <span>Profile Verified</span>
          </div>
          <h2 className="text-xl font-extrabold text-gov-dark">Welcome Back, {profile.full_name}</h2>
          <p className="text-slate-500 text-xs">
            Review welfare matches calculated against your active demographic credentials.
          </p>
        </div>

        {/* Profile Completion circle indicator */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-4 border-gov-green bg-gov-green-light font-extrabold text-xs text-gov-green-dark">
            100%
          </div>
          <div className="text-left text-[11px] leading-tight">
            <span className="font-bold text-slate-700 block">Profile Complete</span>
            <span className="text-slate-400">Eligibility check active</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Fully Eligible"
          value={eligibleSchemes.length}
          subtitle="Meets all requirements"
          icon={CheckSquare}
          variant="green"
        />
        <StatCard
          title="Partial Matches"
          value={partiallyEligibleCount}
          subtitle="Check needed documents"
          icon={TrendingUp}
          variant="purple"
        />
        <StatCard
          title="Saved Schemes"
          value={bookmarkedSchemes.length}
          subtitle="Bookmarked for later"
          icon={Bookmark}
          variant="slate"
        />
        <StatCard
          title="Notifications"
          value={notifications.filter(n => !n.is_read).length}
          subtitle="Unread alert updates"
          icon={Bell}
          variant="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column options */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
            <h3 className="font-extrabold text-sm text-slate-700 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold">
              <Link 
                to="/eligibility" 
                className="p-4 bg-gov-green-light/40 border border-gov-green/10 text-gov-green-dark hover:bg-gov-green-light rounded-xl transition-all text-center"
              >
                Eligibility Checker
              </Link>
              <Link 
                to="/eligible-schemes" 
                className="p-4 bg-gov-purple-light/40 border border-gov-purple/10 text-gov-purple-dark hover:bg-gov-purple-light rounded-xl transition-all text-center"
              >
                My Eligible Schemes
              </Link>
              <Link 
                to="/profile/edit" 
                className="p-4 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 rounded-xl transition-all text-center text-slate-700 col-span-2 sm:col-span-1"
              >
                Edit Demographics
              </Link>
            </div>
          </div>

          {/* Recommended schemes list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
            <h3 className="font-extrabold text-sm text-slate-700 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2 flex justify-between items-center">
              <span>Recommended Schemes</span>
              <Link to="/eligible-schemes" className="text-[10px] text-gov-purple font-bold hover:underline">
                View All
              </Link>
            </h3>

            {eligibleSchemes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {eligibleSchemes.slice(0, 3).map((scheme) => (
                  <div key={scheme.id} className="py-3.5 flex justify-between items-center text-xs">
                    <div className="text-left pr-4">
                      <h4 className="font-bold text-slate-800 leading-snug">{scheme.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-sm sm:max-w-md">{scheme.tagline || scheme.description}</p>
                    </div>
                    <Link
                      to={`/schemes/${scheme.id}`}
                      className="text-gov-green hover:underline font-bold inline-flex items-center space-x-1 shrink-0"
                    >
                      <span>Apply Guide</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No matching schemes. Try updating your profile demographics.</p>
            )}
          </div>

        </div>

        {/* Right column sidebar items */}
        <div className="space-y-8">
          
          {/* Deadlines list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
            <h3 className="font-extrabold text-sm text-slate-700 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
              Upcoming Deadlines
            </h3>

            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4 text-xs">
                {upcomingDeadlines.map((scheme) => (
                  <div key={scheme.id} className="flex justify-between items-center bg-rose-50/20 border border-rose-100/50 p-3 rounded-xl">
                    <div className="text-left pr-3">
                      <h4 className="font-bold text-slate-800 truncate max-w-[130px]">{scheme.name}</h4>
                      <span className="text-[9px] text-rose-600 font-bold block uppercase mt-0.5">Closing Soon</span>
                    </div>
                    <span className="font-bold text-rose-600 bg-rose-100/80 px-2 py-1 rounded shrink-0">
                      {scheme.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2 text-center font-medium">No deadlines approaching.</p>
            )}
          </div>

          {/* Recently Viewed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
            <h3 className="font-extrabold text-sm text-slate-700 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2 flex justify-between items-center">
              <span>Recently Viewed</span>
              <Link to="/recently-viewed" className="text-[10px] text-gov-purple font-bold hover:underline">
                History
              </Link>
            </h3>

            {recentlyViewedSchemes.length > 0 ? (
              <div className="space-y-3.5 text-xs">
                {recentlyViewedSchemes.slice(0, 3).map((scheme) => (
                  <div key={scheme.id} className="flex justify-between items-center">
                    <div className="text-left">
                      <h4 className="font-bold text-slate-700 truncate max-w-[150px]">{scheme.name}</h4>
                      <span className="text-[10px] text-slate-400 block">{scheme.category}</span>
                    </div>
                    <Link to={`/schemes/${scheme.id}`} className="text-slate-400 hover:text-gov-green">
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2 text-center font-medium">No history found.</p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
