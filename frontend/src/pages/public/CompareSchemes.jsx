import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, GitCompare } from 'lucide-react';

export default function CompareSchemes() {
  const [searchParams] = useSearchParams();
  
  // State
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract scheme IDs from URL
  const schemeIds = useMemo(() => {
    const ids = searchParams.get('ids');
    return ids ? ids.split(',').map(String) : [];
  }, [searchParams]);

  // Load all schemes to filter on client
  useEffect(() => {
    setLoading(true);
    api.getSchemes()
      .then(res => {
        if (res.success && res.schemes) {
          setSchemes(res.schemes);
        } else {
          setError('Failed to load schemes for comparison.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching schemes:', err);
        setError('Failed to connect to backend server.');
        setLoading(false);
      });
  }, []);

  // Filter selected schemes
  const selectedSchemes = useMemo(() => {
    return schemes.filter(s => schemeIds.includes(String(s.id)));
  }, [schemes, schemeIds]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center font-sans">
        <div className="w-12 h-12 border-4 border-gov-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Generating comparison matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center font-sans">
        <h3 className="text-lg font-bold text-gov-dark mb-1">Comparison Matrix Error</h3>
        <p className="text-xs text-slate-500 mb-6">{error}</p>
        <Link 
          to="/schemes"
          className="px-4 py-2 bg-gov-purple text-white text-xs font-bold rounded-xl"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      
      {/* Back button */}
      <div className="mb-8">
        <Link 
          to="/schemes" 
          className="inline-flex items-center text-slate-500 hover:text-gov-dark font-semibold text-xs uppercase tracking-wider transition-all"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Back to Catalog
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <GitCompare size={28} className="text-gov-purple" />
          <span>Scheme Comparison Matrix</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Compare criteria, payouts, and mandatory credentials side-by-side.
        </p>
      </div>

      {selectedSchemes.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs">
                  <th className="p-6 text-slate-400 font-bold uppercase tracking-wider w-1/4">Comparison Parameters</th>
                  {selectedSchemes.map(s => (
                    <th key={s.id} className="p-6 w-1/4">
                      <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gov-purple bg-gov-purple-light border border-gov-purple/10 rounded-lg inline-block mb-2">
                        {s.category}
                      </span>
                      <h3 className="font-extrabold text-sm text-gov-dark leading-tight line-clamp-2">
                        {s.name}
                      </h3>
                      <p className="text-[10px] text-slate-450 font-semibold mt-1 leading-snug truncate">
                        {s.department || 'Government Department'}
                      </p>
                    </th>
                  ))}
                  {/* Empty cells to pad out columns if user compares less than 3 */}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <th key={idx} className="p-6 w-1/4 text-center text-xs text-slate-300 font-semibold italic select-none">
                      Slot Empty
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                
                {/* Benefits Payout */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Welfare Benefits</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6 leading-relaxed align-top">{s.benefits || 'No specific benefits text'}</td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* Age Range */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Age Boundaries</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6 font-semibold text-slate-700">
                      {s.rules.age_min ? `${s.rules.age_min} years` : 'No min'} - {s.rules.age_max ? `${s.rules.age_max} years` : 'No max'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* Income Cap */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Maximum Income Cap</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6 font-semibold text-slate-750">
                      {s.rules.income_max ? `₹${s.rules.income_max.toLocaleString()}` : 'No limit'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* State Allowed */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Applicable Region</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6">
                      {s.rules.states_allowed.length > 0 ? s.rules.states_allowed.join(', ') : 'All India (Central)'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* Occupations Allowed */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Target Occupation</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6 capitalize">
                      {s.rules.occupations_allowed.length > 0 ? s.rules.occupations_allowed.join(', ') : 'Any'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* Disability Requirements */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Requires Disability (PwD)</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        s.rules.requires_disability 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {s.rules.requires_disability ? `Yes (${s.rules.min_disability_percentage}%+)` : 'No'}
                      </span>
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-premium">
          <p className="text-xs text-slate-500">No schemes selected for comparison.</p>
        </div>
      )}

    </div>
  );
}
