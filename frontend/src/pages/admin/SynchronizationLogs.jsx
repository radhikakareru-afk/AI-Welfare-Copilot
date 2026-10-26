import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Search, FileText, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function SynchronizationLogs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [dbLogs, setDbLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getSyncLogs(user?.id || 1)
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.logs && res.logs.length > 0) {
          const formatted = res.logs.map(l => ({
            id: `log-${l.id}`,
            provider: l.provider || 'Government Welfare Portal',
            status: l.status,
            started_at: l.started_at,
            duration: l.duration_seconds ? `${l.duration_seconds}s` : '1s',
            added: l.records_inserted || 0,
            updated: l.records_updated || 0,
            failed: l.records_failed || 0,
            details: `Catalog sync operation (${l.sync_type || 'system'}). Processed ${l.records_fetched || 0} scheme records.`,
            error: l.error_message
          }));
          setDbLogs(formatted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading DB sync logs:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [user]);

  const logs = useMemo(() => {
    return dbLogs.filter(log => {
      const searchStr = `${log.provider} ${log.status} ${log.details} ${log.error || ''}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [dbLogs, searchTerm]);

  const toggleExpand = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <FileText size={28} className="text-gov-purple" />
          <span>Synchronization Audit Logs</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Detailed history of scheme synchronization operations, pipeline durations, and node summaries.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search sync logs (e.g. success, error)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs transition-all"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="space-y-4 max-w-4xl">
        {loading ? (
          <div className="bg-white p-8 text-center border border-slate-200 rounded-2xl shadow-premium text-slate-400 text-xs">
            Loading synchronization logs...
          </div>
        ) : logs.length > 0 ? (
          logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div 
                key={log.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden transition-all text-xs"
              >
                {/* Header Summary */}
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="w-full p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center text-left hover:bg-slate-50 transition-all gap-y-3 sm:gap-y-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        log.status === 'success' ? 'bg-emerald-100 text-gov-green' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-700 text-sm">{log.provider}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Started: {new Date(log.started_at).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 font-bold block">DURATION</span>
                      <span className="font-bold text-slate-700">{log.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">STATS</span>
                      <span className="font-bold text-slate-650">+{log.added} / ~{log.updated} / !{log.failed}</span>
                    </div>
                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </button>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100/60 bg-slate-50/50 space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-750 mb-1">Details Summary</h4>
                      <p className="text-slate-550 leading-relaxed">{log.details}</p>
                    </div>

                    {log.error && (
                      <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-850 rounded-xl space-y-1">
                        <h4 className="font-bold text-rose-800 flex items-center">
                          <XCircle size={14} className="mr-1 text-rose-600" />
                          <span>Sync Pipe Error Details</span>
                        </h4>
                        <p className="font-mono text-[10px] leading-relaxed">{log.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-premium">
            <h3 className="text-sm font-bold text-gov-dark mb-1">No Synchronization Audit Logs Found</h3>
            <p className="text-xs text-slate-500">
              Trigger a manual sync from the Sync Monitor to create real audit logs in PostgreSQL.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
