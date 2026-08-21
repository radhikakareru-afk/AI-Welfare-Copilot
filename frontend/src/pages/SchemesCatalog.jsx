import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockSchemes } from '../utils/mockSchemes';
import { evaluateEligibility } from '../utils/eligibilityEngine';
import { 
  Search, 
  Filter, 
  MapPin, 
  Tag, 
  Layers, 
  AlertCircle, 
  ArrowRight,
  GitCompare,
  CheckCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';

export default function SchemesCatalog() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [filterEligible, setFilterEligible] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);

  // Extract unique categories and states for filter dropdowns
  const categories = useMemo(() => {
    return ['All', ...new Set(mockSchemes.map(s => s.category))];
  }, []);

  const states = useMemo(() => {
    const list = new Set();
    mockSchemes.forEach(s => {
      if (s.rules.states_allowed) {
        s.rules.states_allowed.forEach(state => list.add(state));
      }
    });
    return ['All', ...list];
  }, []);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return mockSchemes.filter(scheme => {
      // 1. Text Search
      const searchStr = `${scheme.name} ${scheme.tagline} ${scheme.description} ${scheme.department}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;

      // 3. State Filter
      const matchesState = selectedState === 'All' || 
        scheme.rules.states_allowed.length === 0 || 
        scheme.rules.states_allowed.some(s => s.toLowerCase() === selectedState.toLowerCase());

      // 4. Eligibility Filter (only applicable if logged in as citizen)
      let matchesEligibility = true;
      if (filterEligible && user?.role === 'citizen') {
        const assessment = evaluateEligibility(profile, scheme);
        matchesEligibility = assessment.status === 'eligible' || assessment.status === 'partially_eligible';
      }

      return matchesSearch && matchesCategory && matchesState && matchesEligibility;
    });
  }, [searchTerm, selectedCategory, selectedState, filterEligible, profile, user]);

  // Handle comparison selection
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

  // Navigate to compare page
  const handleCompareSubmit = () => {
    if (selectedCompareIds.length < 2) return;
    navigate(`/compare?ids=${selectedCompareIds.join(',')}`);
  };

  // Eligibility badge renderer
  const renderEligibilityBadge = (scheme) => {
    if (!user) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
          <HelpCircle size={12} className="mr-1" />
          Login to Check
        </span>
      );
    }
    
    if (user.role === 'admin') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
          Admin Preview
        </span>
      );
    }

    const { status } = evaluateEligibility(profile, scheme);

    if (status === 'eligible') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle size={12} className="mr-1" />
          Eligible
        </span>
      );
    } else if (status === 'partially_eligible') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle size={12} className="mr-1" />
          Partially Eligible
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
          <XCircle size={12} className="mr-1" />
          Not Eligible
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Title */}
      <div className="text-left mb-10">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight">Government Schemes Catalog</h1>
        <p className="mt-2 text-slate-500 text-sm">
          Explore and search welfare schemes synchronized from central and state database API nodes.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium mb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Keyword Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by scheme name, benefits, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Tag size={18} />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm transition-all appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat} Schemes</option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin size={18} />
            </div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm appearance-none cursor-pointer"
            >
              <option value="All">All States (Central)</option>
              {states.filter(s => s !== 'All').map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Citizen Specific Filters */}
        {user?.role === 'citizen' && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filterEligible}
                onChange={(e) => setFilterEligible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gov-saffron"></div>
              <span className="ms-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Show Only Schemes I Qualify For
              </span>
            </label>

            {/* Profile context notice */}
            <span className="text-[11px] text-slate-400">
              Matches evaluated against: <strong>{profile.occupation}</strong> ({profile.state})
            </span>
          </div>
        )}
      </div>

      {/* Compare Floating Bar */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white py-3 px-6 rounded-full shadow-2xl z-40 flex items-center space-x-6 border border-slate-800 animate-bounce">
          <span className="text-xs font-bold uppercase tracking-wider">
            {selectedCompareIds.length} scheme{selectedCompareIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCompareIds([])}
              className="px-3 py-1.5 bg-slate-800 rounded-full hover:bg-slate-700 text-xs font-semibold"
            >
              Clear
            </button>
            <button
              onClick={handleCompareSubmit}
              disabled={selectedCompareIds.length < 2}
              className="px-4 py-1.5 bg-gov-saffron text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold inline-flex items-center space-x-1"
            >
              <GitCompare size={14} />
              <span>Compare Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Schemes Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-premium flex flex-col p-6 hover-lift relative overflow-hidden transition-all text-left"
            >
              {/* Compare Select Box */}
              <div className="absolute top-4 right-4 z-10 flex items-center space-x-1 bg-white/95 p-1 px-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 shadow-sm">
                <input
                  type="checkbox"
                  id={`compare-${scheme.id}`}
                  checked={selectedCompareIds.includes(scheme.id)}
                  onChange={() => handleCompareCheckbox(scheme.id)}
                  className="rounded border-slate-300 text-gov-saffron focus:ring-gov-saffron h-3.5 w-3.5"
                />
                <label htmlFor={`compare-${scheme.id}`} className="cursor-pointer select-none">
                  Compare
                </label>
              </div>

              {/* Scheme Category Pill & Eligibility */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gov-saffron bg-orange-50 border border-orange-100 rounded-lg">
                  {scheme.category}
                </span>
                
                {renderEligibilityBadge(scheme)}
              </div>

              {/* Title & Tagline */}
              <h3 className="font-extrabold text-lg text-gov-dark leading-tight line-clamp-1 mb-1">
                {scheme.name}
              </h3>
              <span className="text-slate-400 text-xs font-medium leading-snug line-clamp-2 min-h-[2.5rem] mb-4">
                {scheme.tagline}
              </span>

              {/* Brief details */}
              <div className="space-y-2 border-t border-slate-100 pt-4 mb-6 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Department:</span>
                  <span className="text-right truncate max-w-[150px]" title={scheme.department}>
                    {scheme.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Deadline:</span>
                  <span className={scheme.application_deadline ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                    {scheme.application_deadline 
                      ? new Date(scheme.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Ongoing'}
                  </span>
                </div>
              </div>

              {/* Card Footer Action */}
              <Link
                to={`/schemes/${scheme.id}`}
                className="mt-auto w-full py-2.5 bg-slate-50 hover:bg-gov-saffron hover:text-white border border-slate-200 hover:border-transparent text-slate-700 font-bold text-sm rounded-xl transition-all inline-flex items-center justify-center space-x-1.5"
              >
                <span>View Scheme Details</span>
                <ArrowRight size={14} />
              </Link>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-premium">
          <HelpCircle size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-gov-dark mb-1">No Schemes Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your keyword query, switching category filters, or selecting "All States".
          </p>
        </div>
      )}
      
    </div>
  );
}
