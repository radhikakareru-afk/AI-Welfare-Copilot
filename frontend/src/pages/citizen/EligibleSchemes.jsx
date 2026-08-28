import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { evaluateEligibility } from '../../utils/eligibilityEngine';
import api from '../../services/api';
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  GitCompare, 
  ArrowRight,
  Tag 
} from 'lucide-react';

export default function EligibleSchemes() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);

  // Fetch active schemes on mount
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
        console.error('Error loading eligible schemes:', err);
        setLoading(false);
      });
  }, []);

  // Dynamically build categories from schemes
  const categories = useMemo(() => {
    return ['All', ...new Set(schemes.map(s => s.category))];
  }, [schemes]);

  // Filter schemes to show ONLY eligible & partially eligible
  const qualifiedSchemes = useMemo(() => {
    let result = schemes.map(scheme => {
      const assessment = evaluateEligibility(profile, scheme);
      return {
        ...scheme,
        assessment
      };
    }).filter(scheme => {
      // Must be eligible or partially eligible
      const status = scheme.assessment.status;
      const isQualified = status === 'eligible' || status === 'partially_eligible';
      
      // Text Search
      const searchStr = `${scheme.name} ${scheme.tagline || ''} ${scheme.description || ''} ${scheme.department || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;

      return isQualified && matchesSearch && matchesCategory;
    });

    return result;
  }, [schemes, profile, searchTerm, selectedCategory]);

  const handleCompareCheckbox = (schemeId) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(schemeId)) {
        return prev.filter(id => id !== schemeId);
      } else {
        if (prev.length >= 3) {
          alert('You can select a maximum of 3 schemes for comparison.');
          return prev;
        }
        return [...prev, schemeId];
      }
    });
  };

  const handleCompareSubmit = () => {
    if (selectedCompareIds.length < 2) return;
    navigate(`/compare?ids=${selectedCompareIds.join(',')}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <div className="w-12 h-12 border-4 border-gov-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Running demographics evaluation engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight">My Eligible Schemes</h1>
          <p className="mt-2 text-slate-500 text-sm">
            Personalised list of schemes that match your profile. Check guidelines and prepare certificates.
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search matching schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs transition-all"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Tag size={16} />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs appearance-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Compare Floating Bar */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white py-3 px-6 rounded-full shadow-2xl z-40 flex items-center space-x-6 border border-slate-800 animate-bounce text-xs">
          <span className="font-bold uppercase tracking-wider">
            {selectedCompareIds.length} scheme{selectedCompareIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCompareIds([])}
              className="px-3 py-1.5 bg-slate-800 rounded-full hover:bg-slate-700 font-semibold"
            >
              Clear
            </button>
            <button
              onClick={handleCompareSubmit}
              disabled={selectedCompareIds.length < 2}
              className="px-4 py-1.5 bg-gov-green text-white rounded-full hover:bg-gov-green-dark disabled:opacity-50 disabled:cursor-not-allowed font-bold inline-flex items-center space-x-1"
            >
              <GitCompare size={12} />
              <span>Compare</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of cards */}
      {qualifiedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {qualifiedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-premium flex flex-col p-6 hover-lift relative overflow-hidden transition-all text-left"
            >
              {/* Compare Checkbox */}
              <div className="absolute top-4 right-4 z-10 flex items-center space-x-1 bg-white/95 p-1 px-2 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-500 shadow-sm">
                <input
                  type="checkbox"
                  id={`compare-${scheme.id}`}
                  checked={selectedCompareIds.includes(String(scheme.id))}
                  onChange={() => handleCompareCheckbox(String(scheme.id))}
                  className="rounded border-slate-300 text-gov-purple focus:ring-gov-purple h-3 w-3"
                />
                <label htmlFor={`compare-${scheme.id}`} className="cursor-pointer select-none">
                  Compare
                </label>
              </div>

              {/* Badges */}
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gov-purple bg-gov-purple-light border border-gov-purple/10 rounded-lg">
                  {scheme.category}
                </span>

                {scheme.assessment.status === 'eligible' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-gov-green border border-emerald-100">
                    <CheckCircle size={10} className="mr-1" />
                    Eligible
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-gov-purple border border-purple-100">
                    <AlertCircle size={10} className="mr-1" />
                    Partial
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-sm text-gov-dark leading-tight line-clamp-1 mb-1">
                {scheme.name}
              </h3>
              <span className="text-slate-400 text-[11px] font-medium leading-snug line-clamp-2 min-h-[2.5rem] mb-4">
                {scheme.tagline || scheme.description}
              </span>

              {/* Brief details */}
              <div className="space-y-2 border-t border-slate-100 pt-4 mb-6 text-[10px] text-slate-500">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Benefits:</span>
                  <span className="text-right truncate max-w-[130px] font-semibold text-slate-700" title={scheme.benefits}>
                    {scheme.benefits || 'Financial Assistance'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Deadline:</span>
                  <span className={scheme.application_deadline ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                    {scheme.application_deadline 
                      ? new Date(scheme.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : 'Ongoing'}
                  </span>
                </div>
              </div>

              <Link
                to={`/schemes/${scheme.id}`}
                className="mt-auto w-full py-2 bg-slate-50 hover:bg-gov-green hover:text-white border border-slate-200 hover:border-transparent text-slate-700 font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center space-x-1.5"
              >
                <span>View Details</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-premium">
          <AlertCircle size={32} className="mx-auto text-slate-350 mb-4" />
          <h3 className="text-sm font-bold text-gov-dark mb-1">No Matches Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't qualify for any schemes currently. Try editing your demographics (e.g. adjust your income bounds).
          </p>
        </div>
      )}

    </div>
  );
}
