import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { evaluateEligibility } from '../../utils/eligibilityEngine';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Milestone,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SchemeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, favorites, toggleFavorite, addRecentlyViewed } = useAuth();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch scheme details on load
  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getScheme(id)
      .then(res => {
        if (res.success && res.scheme) {
          setScheme(res.scheme);
          // Register view history
          if (user?.role === 'citizen') {
            addRecentlyViewed(res.scheme.id);
          }
        } else {
          setError('Scheme not found in database.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching scheme details:', err);
        setError('Failed to connect to backend server.');
        setLoading(false);
      });
  }, [id, user]);

  const isBookmarked = useMemo(() => {
    if (!scheme) return false;
    return favorites.includes(String(scheme.id));
  }, [scheme, favorites]);

  // Compute eligibility details
  const eligibilityAssessment = useMemo(() => {
    if (!user || user.role !== 'citizen' || !scheme) return null;
    return evaluateEligibility(profile, scheme);
  }, [user, profile, scheme]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center font-sans">
        <div className="w-12 h-12 border-4 border-gov-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Fetching scheme criteria and documents...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center font-sans">
        <AlertCircle size={48} className="mx-auto text-rose-600 mb-4" />
        <h3 className="text-lg font-bold text-gov-dark mb-1">Details Loading Failure</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">{error || 'Scheme details not available'}</p>
        <Link 
          to="/schemes"
          className="px-4 py-2 bg-gov-purple text-white text-xs font-bold rounded-xl hover:bg-gov-purple-dark transition-all"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      
      {/* Back button & Bookmark action */}
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/schemes" 
          className="inline-flex items-center text-slate-500 hover:text-gov-dark font-semibold text-xs uppercase tracking-wider transition-all"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Back to Catalog
        </Link>

        {user?.role === 'citizen' && (
          <button
            onClick={() => toggleFavorite(scheme.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center space-x-1.5 transition-all ${
              isBookmarked 
                ? 'bg-purple-50 border-purple-200 text-gov-purple-dark' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-gov-dark hover:bg-slate-50'
            }`}
          >
            <Bookmark size={14} className={isBookmarked ? 'fill-current text-gov-purple' : ''} />
            <span>{isBookmarked ? 'Saved' : 'Save Scheme'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Info columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2-cols: Main details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-green"></div>
            
            <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gov-purple bg-gov-purple-light border border-gov-purple/10 rounded-lg inline-block mb-3">
              {scheme.category}
            </span>

            <h1 className="text-xl md:text-2xl font-extrabold text-gov-dark leading-tight">
              {scheme.name}
            </h1>
            {scheme.tagline && (
              <p className="text-slate-500 mt-2 text-xs italic">
                {scheme.tagline}
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-400 block mb-1">STATE APPLICABILITY</span>
                <span className="font-semibold text-gov-dark">{scheme.state || 'All India'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-1">OFFICIAL SCHEME CODE</span>
                <span className="font-semibold text-gov-dark uppercase">{scheme.official_id}</span>
              </div>
            </div>
          </div>

          {/* Eligibility Explanation Block (For logged-in Citizen) */}
          {user?.role === 'citizen' && eligibilityAssessment && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium relative overflow-hidden">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles size={18} className="text-gov-saffron" />
                <h3 className="font-bold text-base text-gov-dark">Personalized Eligibility Report</h3>
              </div>

              {eligibilityAssessment.status === 'eligible' && (
                <div className="bg-emerald-50/60 border border-emerald-200 text-emerald-900 p-4 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
                    <CheckCircle2 size={18} className="text-gov-green" />
                    <span>You satisfy all primary constraints. You are Eligible!</span>
                  </div>
                  <ul className="text-xs space-y-2 list-disc pl-5 text-emerald-700 text-left">
                    {eligibilityAssessment.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {eligibilityAssessment.status === 'partially_eligible' && (
                <div className="bg-amber-50/60 border border-amber-200 text-amber-900 p-4 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-amber-800 text-sm">
                    <AlertCircle size={18} className="text-gov-saffron" />
                    <span>You satisfy key thresholds but may require self-declaration profiles.</span>
                  </div>
                  <ul className="text-xs space-y-2 list-disc pl-5 text-amber-700 text-left">
                    {eligibilityAssessment.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {eligibilityAssessment.status === 'ineligible' && (
                <div className="bg-rose-50/60 border border-rose-200 text-rose-900 p-4 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-rose-800 text-sm">
                    <XCircle size={18} className="text-rose-600" />
                    <span>Eligibility mismatch detected.</span>
                  </div>
                  <ul className="text-xs space-y-2 list-disc pl-5 text-rose-700 text-left">
                    {eligibilityAssessment.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Description & Benefits */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-gov-dark mb-3">Scheme Overview</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{scheme.description}</p>
            </div>
            
            {scheme.benefits && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-extrabold text-base text-gov-dark mb-3">Benefits Offered</h3>
                <div className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">{scheme.benefits}</div>
              </div>
            )}
          </div>

          {/* Application Steps */}
          {scheme.steps && scheme.steps.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
              <h3 className="font-extrabold text-base text-gov-dark mb-6 inline-flex items-center space-x-2">
                <Milestone size={18} className="text-gov-saffron" />
                <span>Step-by-Step Application Guidance</span>
              </h3>

              <div className="space-y-6">
                {scheme.steps.map((step) => (
                  <div key={step.step_number} className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-gov-saffron font-bold text-sm shrink-0">
                      {step.step_number}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 1-col: Required Docs & Quick Actions */}
        <div className="space-y-8">
          
          {/* Action Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Application Action</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify your physical credentials at local block offices or click below to visit the official portal.
            </p>
            {scheme.portal_url && (
              <a
                href={scheme.portal_url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-gov-green hover:bg-gov-green-dark text-white text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center space-x-1.5"
              >
                <span>Visit Official Portal</span>
                <ExternalLink size={12} />
              </a>
            )}
            <div className="flex items-center justify-center text-[10px] text-slate-400 space-x-1">
              <Clock size={10} />
              <span>Application is active for fiscal cycle</span>
            </div>
          </div>

          {/* Documents Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
            <h3 className="font-extrabold text-sm text-gov-dark mb-4 inline-flex items-center space-x-2">
              <FileText size={16} className="text-gov-purple" />
              <span>Required Documents</span>
            </h3>

            {scheme.documents && scheme.documents.length > 0 ? (
              <div className="space-y-4">
                {scheme.documents.map((doc, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{doc.document_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                        doc.is_mandatory 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{doc.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-450 italic">No specific documents specified.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
