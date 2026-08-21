import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Layers, CheckCircle2, AlertTriangle, Play, HelpCircle, Clock } from 'lucide-react';

export default function AdminSync() {
  const [syncLogs, setSyncLogs] = useState([
    {
      id: "sync-102",
      provider: "MyScheme Central API",
      status: "success",
      added: 2,
      updated: 12,
      started_at: "2026-08-01T05:45:00Z",
      completed_at: "2026-08-01T05:45:08Z",
      details: "Parsed 142 total schemes. 2 new schemes added (NFPwD, Mah Shetkari). 12 deadling strings updated."
    },
    {
      id: "sync-101",
      provider: "Maharashtra State Portal",
      status: "success",
      added: 0,
      updated: 5,
      started_at: "2026-08-01T03:30:00Z",
      completed_at: "2026-08-01T03:30:02Z",
      details: "State scheme mappings refreshed. Synced deadlines with Maharashtra GR directives."
    },
    {
      id: "sync-100",
      provider: "National Scholarship Gateway",
      status: "failed",
      added: 0,
      updated: 0,
      started_at: "2026-08-01T01:00:00Z",
      completed_at: "2026-08-01T01:00:15Z",
      error: "Error response code 503 Service Unavailable from scholarship.gov.in/api/v1/schemes.",
      details: "Sync pipeline terminated due to provider gateway timeout. Rescheduled execution active."
    }
  ]);

  const [triggering, setTriggering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleTriggerSync = () => {
    setTriggering(true);
    setSuccessMsg('');
    
    // Simulate sync runtime process
    setTimeout(() => {
      setTriggering(false);
      const newLog = {
        id: `sync-${Math.floor(Math.random() * 100) + 103}`,
        provider: "Manual Trigger (All Active Providers)",
        status: "success",
        added: 1,
        updated: 3,
        started_at: new Date().toISOString(),
        completed_at: new Date(Date.now() + 3200).toISOString(),
        details: "Manual synchronisation executed. Scanned 4 providers. Added 1 scheme. Refreshed 3 deadlines."
      };
      setSyncLogs(prev => [newLog, ...prev]);
      setSuccessMsg('Synchronization completed successfully! Logs updated.');
      
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 3200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      {/* Back button */}
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-slate-500 hover:text-gov-dark font-semibold text-sm transition-all"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Admin Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-4 mb-10 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
            <RefreshCw size={28} className="text-gov-saffron animate-spin-slow" />
            <span>Scheme Synchronization Service</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Monitor API integration nodes, view system-wide synchronization history, or trigger immediate schema updates.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={triggering}
          className="w-full sm:w-auto px-5 py-3.5 bg-gov-dark hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center space-x-2 disabled:opacity-50 hover-lift shadow-md"
        >
          <Play size={14} className="fill-current text-gov-saffron" />
          <span>{triggering ? 'Synchronizing nodes...' : 'Trigger Manual Sync'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold mb-6">
          <CheckCircle2 size={18} className="text-gov-green" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sync Service State Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs text-slate-600">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
          <span className="font-bold text-slate-400 block mb-1">SERVICE HEALTH</span>
          <span className="text-sm font-bold text-gov-green flex items-center">
            <CheckCircle2 size={14} className="mr-1 text-gov-green" />
            All Systems Operational
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
          <span className="font-bold text-slate-400 block mb-1">REGISTERED PROVIDER API NODES</span>
          <span className="text-sm font-bold text-slate-700">4 Active Providers</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
          <span className="font-bold text-slate-400 block mb-1">CRON SCHEDULE STATUS</span>
          <span className="text-sm font-bold text-slate-700">Running daily at 00:00 UTC</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-gov-dark">Synchronization Audit Logs</h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Showing last 20 logs</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {syncLogs.map((log) => (
            <div key={log.id} className="p-6 text-left space-y-4 hover:bg-slate-50/50 transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                    <span>{log.provider}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">ID: {log.id}</span>
                  </h4>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-semibold uppercase mt-1">
                    <Clock size={12} />
                    <span>
                      Run started:{' '}
                      {new Date(log.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}{' '}
                      ({new Date(log.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
                  {/* Status badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                    log.status === 'success'
                      ? 'bg-emerald-50 text-gov-green border border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {log.status === 'success' ? 'SUCCESS' : 'FAILED'}
                  </span>

                  {/* Telemetry updates counts */}
                  {log.status === 'success' && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold text-[10px] shrink-0">
                      +{log.added} added / {log.updated} updated
                    </span>
                  )}
                </div>
              </div>

              {/* Log Message Details */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed text-slate-500">
                <p className="font-medium">{log.details}</p>
                {log.error && (
                  <p className="mt-2 text-rose-600 font-bold flex items-start space-x-1">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{log.error}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
