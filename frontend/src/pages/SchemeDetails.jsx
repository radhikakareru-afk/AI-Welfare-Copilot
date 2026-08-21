import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockSchemes } from '../utils/mockSchemes';
import { evaluateEligibility } from '../utils/eligibilityEngine';
import { 
  ArrowLeft, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Milestone,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SchemeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, favorites, toggleFavorite, addRecentlyViewed } = useAuth();

  // Find the scheme matching ID
  const scheme = useMemo(() => {
    return mockSchemes.find(s => s.id === id);
  }, [id]);

  // Safe redirect if invalid ID
  useEffect(() => {
    if (!scheme) {
      navigate('/schemes');
    } else if (user?.role === 'citizen') {
      addRecentlyViewed(scheme.id);
    }
  }, [scheme, navigate, user, addRecentlyViewed]);

  if (!scheme) return null;

  const isBookmarked = favorites.includes(scheme.id);

  // Compute eligibility details
  const eligibilityAssessment = useMemo(() => {
    if (!user || user.role !== 'citizen') return null;
    return evaluateEligibility(profile, scheme);
  }, [user, profile, scheme]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      
      {/* Back button & Bookmark action */}
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/schemes" 
          className="inline-flex items-center text-slate-500 hover:text-gov-dark font-semibold text-sm transition-all"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Schemes Catalog
        </Link>

        {user?.role === 'citizen' && (
          <button
            onClick={() => toggleFavorite(scheme.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center space-x-1.5 transition-all ${
              isBookmarked 
                ? 'bg-orange-50 border-orange-200 text-gov-accent' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-gov-dark hover:bg-slate-50'
            }`}
          >
            <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
            <span>{isBookmarked ? 'Scheme Saved' : 'Save Scheme'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Info columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2-cols: Main details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-saffron"></div>
            
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gov-saffron bg-orange-50 border border-orange-100 rounded-lg inline-block mb-3">
              {scheme.category}
            </span>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gov-dark leading-tight">
              {scheme.name}
            </h1>
            <p className="text-slate-500 mt-2 text-sm italic">
              {scheme.tagline}
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-400 block mb-1">DEPARTMENT</span>
                <span className="font-semibold text-gov-dark">{scheme.department}</span>
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
                  <ul className="text-xs space-y-2 list-disc pl-5 text-emerald-700">
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
                  <ul className="text-xs space-y-2 list-disc pl-5 text-amber-700">
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
                  <ul className="text-xs space-y-2 list-disc pl-5 text-rose-700">
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
            
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-extrabold text-base text-gov-dark mb-3">Benefits Offered</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{scheme.benefits}</p>
            </div>
          </div>

          {/* Application Steps */}
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

        </div>

        {/* Right 1-col: Required Docs & Quick Actions */}
        <div className="space-y-8">
          
          {/* Apply Now Call-To-Action */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white">Official Application Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filing is performed on official government websites. Tap the link below to load the registration page in a new window.
            </p>
            {scheme.portal_url ? (
              <a
                href={scheme.portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gradient-saffron hover:shadow-lg hover:shadow-orange-500/20 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center space-x-1.5"
              >
                <span>Visit Application Portal</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed"
              >
                No Portal URL Available
              </button>
            )}
          </div>

          {/* Required Documents checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
            <h3 className="font-extrabold text-base text-gov-dark mb-4 inline-flex items-center space-x-2">
              <FileText size={18} className="text-gov-saffron" />
              <span>Required Documents</span>
            </h3>

            <div className="space-y-4">
              {scheme.documents.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 text-xs truncate max-w-[170px]" title={doc.document_name}>
                      {doc.document_name}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      doc.is_mandatory 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">{doc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats sidebar details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-4 text-xs text-slate-600">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-bold text-slate-400 inline-flex items-center">
                <Clock size={13} className="mr-1" />
                Filing Status
              </span>
              <span className="font-bold text-slate-700">Open</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="font-bold text-slate-400">Target Group</span>
              <span className="font-bold text-slate-700 capitalize">
                {scheme.rules.occupations_allowed.length > 0 
                  ? scheme.rules.occupations_allowed.join(', ')
                  : 'All Citizens'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-slate-400">Regionality</span>
              <span className="font-bold text-slate-700">
                {scheme.rules.states_allowed.length > 0 
                  ? scheme.rules.states_allowed.join(', ')
                  : 'National (All India)'}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
