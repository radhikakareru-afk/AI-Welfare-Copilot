import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STATES_LIST, OCCUPATIONS_LIST } from '../../data/users';
import { evaluateEligibility } from '../../utils/eligibilityEngine';
import api from '../../services/api';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  ArrowRight,
  GitCompare,
  CheckCircle,
  HelpCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function BrowseSchemes() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // API State
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedOccupation, setSelectedOccupation] = useState('All');
  const [minAge, setMinAge] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);
  const [filterEligible, setFilterEligible] = useState(false);

  // Fetch schemes from API
  useEffect(() => {
    setLoading(true);
    api.getSchemes()
      .then(res => {
        if (res.success && res.schemes) {
          setSchemes(res.schemes);
        } else {
          setError('Failed to load schemes from database.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching schemes:', err);
        setError('Failed to connect to backend server.');
        setLoading(false);
      });
  }, []);

  // Dynamically extract categories from live schemes list
  const categories = useMemo(() => {
    return ['All', ...new Set(schemes.map(s => s.category))];
  }, [schemes]);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    let result = schemes.filter(scheme => {
      // 1. Text Search
      const searchStr = `${scheme.name} ${scheme.tagline || ''} ${scheme.description || ''} ${scheme.department || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;

      // 3. State Filter
      const matchesState = selectedState === 'All' || 
        !scheme.rules || 
        !scheme.rules.states_allowed ||
        scheme.rules.states_allowed.length === 0 || 
        scheme.rules.states_allowed.some(s => s.toLowerCase() === selectedState.toLowerCase());

      // 4. Occupation Filter
      const matchesOccupation = selectedOccupation === 'All' ||
        !scheme.rules ||
        !scheme.rules.occupations_allowed ||
        scheme.rules.occupations_allowed.length === 0 ||
        scheme.rules.occupations_allowed.some(o => o.toLowerCase() === selectedOccupation.toLowerCase());

      // 5. Age filter
      let matchesAge = true;
      if (minAge && scheme.rules) {
        const parsedAge = Number(minAge);
        const rules = scheme.rules;
        if (rules.age_min !== null && parsedAge < rules.age_min) matchesAge = false;
        if (rules.age_max !== null && parsedAge > rules.age_max) matchesAge = false;
      }

      // 6. Eligibility Filter (only if logged in as citizen)
      let matchesEligibility = true;
      if (filterEligible && user?.role === 'citizen') {
        const assessment = evaluateEligibility(profile, scheme);
        matchesEligibility = assessment.status === 'eligible' || assessment.status === 'partially_eligible';
      }

      return matchesSearch && matchesCategory && matchesState && matchesOccupation && matchesAge && matchesEligibility;
    });

    // Sort schemes
    result.sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'deadline-near') {
        if (!a.application_deadline) return 1;
        if (!b.application_deadline) return -1;
        return new Date(a.application_deadline) - new Date(b.application_deadline);
      }
      return 0;
    });

    return result;
  }, [schemes, searchTerm, selectedCategory, selectedState, selectedOccupation, minAge, sortOption, filterEligible, profile, user]);

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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
          <HelpCircle size={10} className="mr-1" />
          Login to Check
        </span>
      );
    }
    
    if (user.role === 'admin') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
          Admin Mode
        </span>
      );
    }

    const { status } = evaluateEligibility(profile, scheme);

    if (status === 'eligible') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-gov-green border border-emerald-100">
          <CheckCircle size={10} className="mr-1" />
          Eligible
        </span>
      );
    } else if (status === 'partially_eligible') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-gov-purple border border-purple-100">
          <AlertCircle size={10} className="mr-1" />
          Partial Match
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
          <XCircle size={10} className="mr-1" />
          Not Eligible
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center font-sans">
        <div className="w-12 h-12 border-4 border-gov-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Loading government schemes catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center font-sans">
        <AlertCircle size={48} className="mx-auto text-rose-600 mb-4" />
        <h3 className="text-lg font-bold text-gov-dark mb-1">Catalog Connection Error</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gov-purple text-white text-xs font-bold rounded-xl hover:bg-gov-purple-dark transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Header section */}
      <div className="text-left mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gov-dark tracking-tight">
          Government Welfare Catalog
        </h1>
        <p className="mt-1 text-slate-500 text-xs md:text-sm">
          Browse, filter, and compare active welfare schemes available across state and central departments.
        </p>
      </div>

      {/* Filter and search card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search scheme name, department, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin size={16} />
            </div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs appearance-none cursor-pointer"
            >
              <option value="All">All States</option>
              {STATES_LIST.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Second row filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 items-center justify-between mt-4">
          {/* Occupation Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase size={16} />
            </div>
            <select
              value={selectedOccupation}
              onChange={(e) => setSelectedOccupation(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs appearance-none cursor-pointer"
            >
              <option value="All">All Occupations</option>
              {OCCUPATIONS_LIST.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          {/* Age filter */}
          <div>
            <input
              type="number"
              placeholder="Filter by Age (e.g. 25)"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs"
            />
          </div>

          {/* Sorting */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs appearance-none cursor-pointer"
            >
              <option value="name-asc">Sort: A to Z</option>
              <option value="name-desc">Sort: Z to A</option>
              <option value="deadline-near">Sort: Closing Soon</option>
            </select>
          </div>

          {/* Toggle qualification */}
          {user?.role === 'citizen' && (
            <div className="flex justify-end">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterEligible}
                  onChange={(e) => setFilterEligible(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gov-green"></div>
                <span className="ms-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Show Qualified Only
                </span>
              </label>
            </div>
          )}
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

      {/* Schemes Catalog Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-premium flex flex-col p-6 hover-lift relative overflow-hidden transition-all text-left"
            >
              {/* Compare Select Box */}
              <div className="absolute top-4 right-4 z-10 flex items-center space-x-1 bg-white/95 p-1 px-2 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-500 shadow-sm">
                <input
                  type="checkbox"
                  id={`compare-${scheme.id}`}
                  checked={selectedCompareIds.includes(scheme.id)}
                  onChange={() => handleCompareCheckbox(scheme.id)}
                  className="rounded border-slate-300 text-gov-purple focus:ring-gov-purple h-3 w-3"
                />
                <label htmlFor={`compare-${scheme.id}`} className="cursor-pointer select-none">
                  Compare
                </label>
              </div>

              {/* Scheme Category Pill & Eligibility */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gov-purple bg-gov-purple-light border border-gov-purple/10 rounded-lg">
                  {scheme.category}
                </span>
                
                {renderEligibilityBadge(scheme)}
              </div>

              {/* Title & Tagline */}
              <h3 className="font-extrabold text-sm text-gov-dark leading-tight line-clamp-1 mb-1">
                {scheme.name}
              </h3>
              <span className="text-slate-400 text-[11px] font-medium leading-snug line-clamp-2 min-h-[2.5rem] mb-4">
                {scheme.tagline || scheme.description}
              </span>

              {/* Brief details */}
              <div className="space-y-2 border-t border-slate-100 pt-4 mb-6 text-[10px] text-slate-500">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">State:</span>
                  <span className="text-right font-medium text-slate-700">{scheme.state || 'All India'}</span>
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
          <HelpCircle size={32} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-sm font-bold text-gov-dark mb-1">No Schemes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your keyword query, filters, or clearing age boundaries.
          </p>
        </div>
      )}
      
    </div>
  );
}
