import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Clock, ArrowRight } from 'lucide-react';

export default function RecentlyViewed() {
  const { recentlyViewed } = useAuth();
  
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch schemes from API on mount
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
        console.error('Error fetching schemes for recently viewed page:', err);
        setLoading(false);
      });
  }, []);

  const recentlyViewedSchemes = useMemo(() => {
    return schemes.filter(s => recentlyViewed.includes(String(s.id)));
  }, [schemes, recentlyViewed]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <div className="w-12 h-12 border-4 border-gov-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Loading view history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <Clock size={28} className="text-gov-purple" />
          <span>Recently Viewed Schemes</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Browse your recently visited pages to quickly access checklists or guides.
        </p>
      </div>

      {recentlyViewedSchemes.length > 0 ? (
        <div className="space-y-4 max-w-4xl">
          {recentlyViewedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
            >
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gov-purple bg-gov-purple-light border border-gov-purple/10 rounded-lg">
                  {scheme.category}
                </span>

                <h3 className="font-extrabold text-sm text-gov-dark leading-snug">
                  {scheme.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {scheme.tagline || scheme.description}
                </p>
              </div>

              <Link
                to={`/schemes/${scheme.id}`}
                className="px-4 py-2.5 bg-slate-50 hover:bg-gov-green hover:text-white border border-slate-200 hover:border-transparent text-slate-700 font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center space-x-1 shrink-0"
              >
                <span>View Guide</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-premium max-w-xl mx-auto">
          <Clock size={40} className="mx-auto text-slate-350 mb-4" />
          <h3 className="text-sm font-bold text-gov-dark mb-1">No Recent Schemes</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
            Pages you visit in the Schemes Catalog will be logged here for quick reference.
          </p>
          <Link
            to="/schemes"
            className="px-6 py-3 bg-gov-green text-white font-bold rounded-xl text-xs hover-lift transition-all inline-block shadow-md shadow-emerald-500/10"
          >
            Browse Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
