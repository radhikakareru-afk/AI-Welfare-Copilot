import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { evaluateEligibility } from '../../utils/eligibilityEngine';
import api from '../../services/api';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';

export default function Favorites() {
  const { profile, favorites, toggleFavorite } = useAuth();
  
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
        console.error('Error fetching schemes for favorites page:', err);
        setLoading(false);
      });
  }, []);

  const bookmarkedSchemes = useMemo(() => {
    return schemes.filter(s => favorites.includes(String(s.id)));
  }, [schemes, favorites]);

  const renderEligibilityBadge = (scheme) => {
    const { status } = evaluateEligibility(profile, scheme);

    if (status === 'eligible') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-gov-green border border-emerald-100">
          Eligible
        </span>
      );
    } else if (status === 'partially_eligible') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-gov-purple border border-purple-100">
          Partial Match
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
          Not Eligible
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <div className="w-12 h-12 border-4 border-gov-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Loading bookmarked schemes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <Bookmark size={28} className="text-gov-purple fill-current" />
          <span>Saved Bookmarks</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          A list of schemes you bookmarked for tracking. Make sure to file applications before deadlines pass.
        </p>
      </div>

      {bookmarkedSchemes.length > 0 ? (
        <div className="space-y-4 max-w-4xl">
          {bookmarkedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gov-purple bg-gov-purple-light border border-gov-purple/10 rounded-lg">
                    {scheme.category}
                  </span>
                  {renderEligibilityBadge(scheme)}
                </div>

                <h3 className="font-extrabold text-sm text-gov-dark leading-snug">
                  {scheme.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium truncate max-w-lg">
                  {scheme.tagline || scheme.description}
                </p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleFavorite(scheme.id)}
                  className="p-3 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  title="Remove Bookmark"
                >
                  <Trash2 size={16} />
                </button>
                <Link
                  to={`/schemes/${scheme.id}`}
                  className="flex-grow sm:flex-grow-0 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center space-x-1"
                >
                  <span>Open Guide</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-premium max-w-xl mx-auto">
          <Bookmark size={40} className="mx-auto text-slate-350 mb-4" />
          <h3 className="text-sm font-bold text-gov-dark mb-1">No Saved Bookmarks</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
            Bookmark items in the Catalog to view them here for quick access later.
          </p>
          <Link
            to="/schemes"
            className="px-6 py-3 bg-gov-purple text-white font-bold rounded-xl text-xs hover-lift transition-all inline-block shadow-md shadow-purple-500/10"
          >
            Browse Schemes
          </Link>
        </div>
      )}
    </div>
  );
}
