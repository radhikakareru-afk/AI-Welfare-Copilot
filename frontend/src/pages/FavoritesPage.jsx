import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockSchemes } from '../utils/mockSchemes';
import { evaluateEligibility } from '../utils/eligibilityEngine';
import { Bookmark, ArrowLeft, Trash2, ArrowRight, HelpCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function FavoritesPage() {
  const { user, profile, favorites, toggleFavorite } = useAuth();

  // Retrieve bookmarked schemes
  const bookmarkedSchemes = useMemo(() => {
    return mockSchemes.filter(s => favorites.includes(s.id));
  }, [favorites]);

  const renderEligibilityBadge = (scheme) => {
    const { status } = evaluateEligibility(profile, scheme);

    if (status === 'eligible') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          Eligible
        </span>
      );
    } else if (status === 'partially_eligible') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
          Partially Eligible
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      {/* Back to dashboard */}
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-slate-500 hover:text-gov-dark font-semibold text-sm transition-all"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="text-left mb-10">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <Bookmark size={28} className="text-gov-saffron fill-current" />
          <span>My Saved Schemes</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          A list of schemes you bookmarked for tracking. Make sure to file applications before deadlines pass.
        </p>
      </div>

      {bookmarkedSchemes.length > 0 ? (
        <div className="space-y-4">
          {bookmarkedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gov-saffron bg-orange-50 border border-orange-100 rounded-lg">
                    {scheme.category}
                  </span>
                  {renderEligibilityBadge(scheme)}
                </div>

                <h3 className="font-extrabold text-base text-gov-dark leading-snug">
                  {scheme.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium truncate max-w-lg">
                  {scheme.tagline}
                </p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleFavorite(scheme.id)}
                  className="p-3 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center shrink-0"
                  title="Remove Bookmark"
                >
                  <Trash2 size={16} />
                </button>
                <Link
                  to={`/schemes/${scheme.id}`}
                  className="flex-grow sm:flex-grow-0 px-4 py-2.5 bg-slate-950 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all inline-flex items-center justify-center space-x-1"
                >
                  <span>Open Guide</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-premium">
          <Bookmark size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-gov-dark mb-1">No Schemes Saved</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Bookmark items in the Catalog to view them here for quick access later.
          </p>
          <Link
            to="/schemes"
            className="px-6 py-3 bg-gradient-saffron text-white font-bold rounded-xl text-xs hover-lift transition-all inline-block"
          >
            Browse Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
