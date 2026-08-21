import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { mockSchemes } from '../../data/schemes';
import { ArrowLeft, GitCompare, ExternalLink, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';

export default function CompareSchemes() {
  const [searchParams] = useSearchParams();
  
  // Extract scheme IDs
  const schemeIds = useMemo(() => {
    const ids = searchParams.get('ids');
    return ids ? ids.split(',') : [];
  }, [searchParams]);

  // Fetch selected schemes
  const selectedSchemes = useMemo(() => {
    return mockSchemes.filter(s => schemeIds.includes(s.id));
  }, [schemeIds]);

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
                        {s.department}
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
                    <td key={s.id} className="p-6 leading-relaxed align-top">{s.benefits}</td>
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
                    <td key={s.id} className="p-6 font-semibold text-slate-700">
                      {s.rules.income_max ? `₹${s.rules.income_max.toLocaleString()} / year` : 'No income cap'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* State constraints */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Active Geography</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6 font-semibold text-slate-700 capitalize">
                      {s.rules.states_allowed.length > 0 ? s.rules.states_allowed.join(', ') : 'All India (Central)'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* Allowed Occupations */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Target Occupations</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6 font-semibold text-slate-700 capitalize">
                      {s.rules.occupations_allowed.length > 0 ? s.rules.occupations_allowed.join(', ') : 'All Citizens'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* Required Documents */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Mandatory Documents</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6 align-top">
                      <ul className="space-y-1 pl-4 list-disc text-slate-500">
                        {s.documents.filter(d => d.is_mandatory).map((doc, i) => (
                          <li key={i}>{doc.document_name}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - selectedSchemes.length) }).map((_, idx) => (
                    <td key={idx} className="p-6"></td>
                  ))}
                </tr>

                {/* Direct Action Link */}
                <tr>
                  <td className="p-6 font-bold text-gov-dark bg-slate-50/20">Filing Links</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="p-6 align-top">
                      <div className="space-y-2">
                        <Link
                          to={`/schemes/${s.id}`}
                          className="w-full py-2 bg-slate-100 hover:bg-gov-green hover:text-white text-slate-700 font-bold rounded-lg text-[10px] transition-all inline-flex justify-center items-center"
                        >
                          View Guide
                        </Link>
                        {s.portal_url && (
                          <a
                            href={s.portal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-slate-900 text-slate-350 hover:text-white font-bold rounded-lg text-[10px] transition-all inline-flex justify-center items-center space-x-1"
                          >
                            <span>Apply Site</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
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
          <GitCompare size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-sm font-bold text-gov-dark mb-1">No Schemes Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Visit the Catalog, select multiple check-boxes on schemes, and click compare.
          </p>
          <Link
            to="/schemes"
            className="px-6 py-3 bg-gov-green text-white font-bold rounded-xl text-xs hover-lift transition-all inline-block shadow-md shadow-emerald-500/10"
          >
            Go to Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
