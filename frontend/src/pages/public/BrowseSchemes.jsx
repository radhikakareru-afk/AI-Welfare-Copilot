import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockSchemes } from '../../data/schemes';
import { STATES_LIST, OCCUPATIONS_LIST, CATEGORIES_LIST } from '../../data/users';
import { evaluateEligibility } from '../../utils/eligibilityEngine';
import { 
  Search, 
  MapPin, 
  Tag, 
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

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedOccupation, setSelectedOccupation] = useState('All');
  const [minAge, setMinAge] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);
  const [filterEligible, setFilterEligible] = useState(false);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    let result = mockSchemes.filter(scheme => {
      // 1. Text Search
      const searchStr = `${scheme.name} ${scheme.tagline} ${scheme.description} ${scheme.department}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;

      // 3. State Filter
      const matchesState = selectedState === 'All' || 
        scheme.rules.states_allowed.length === 0 || 
        scheme.rules.states_allowed.some(s => s.toLowerCase() === selectedState.toLowerCase());

      // 4. Occupation Filter
      const matchesOccupation = selectedOccupation === 'All' ||
        scheme.rules.occupations_allowed.length === 0 ||
        scheme.rules.occupations_allowed.some(o => o.toLowerCase() === selectedOccupation.toLowerCase());

      // 5. Age filter
      let matchesAge = true;
      if (minAge) {
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
  }, [searchTerm, selectedCategory, selectedState, selectedOccupation, minAge, sortOption, filterEligible, profile, user]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight">Government Schemes Catalog</h1>
        <p className="mt-2 text-slate-500 text-sm">
          Explore and search welfare schemes synchronized from central and state database API nodes.
        </p>
      </div>

      {/* Filter Controls Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium mb-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          
          {/* Keyword Search */}
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by scheme name, benefits, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs transition-all"
            />
          </div>

          {/* Category Dropdown */}
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
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Pension & Insurance">Pension & Insurance</option>
              <option value="Health & Medical">Health & Medical</option>
              <option value="Housing">Housing</option>
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
        </div>

        {/* Second row filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 items-center justify-between">
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

          {/* Age-related filter */}
          <div>
            <input
              type="number"
              placeholder="Filter by Age (e.g. 25)"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs"
            />
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
                {scheme.tagline}
              </span>

              {/* Brief details */}
              <div className="space-y-2 border-t border-slate-100 pt-4 mb-6 text-[10px] text-slate-500">
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
