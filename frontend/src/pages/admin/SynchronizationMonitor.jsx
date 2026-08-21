import React, { useState } from 'react';
import { MOCK_ANALYTICS } from '../../data/analytics';
import { RefreshCw, Play, CheckCircle2, Cpu, AlertTriangle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';

export default function SynchronizationMonitor() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Idle');
  const [success, setSuccess] = useState('');

  const [providerStatuses, setProviderStatuses] = useState([
    { name: 'MyScheme Central Portal API', status: 'Healthy', code: 'API-MY-SCHEME', last_sync: '15m ago', speed: '95ms' },
    { name: 'Maharashtra Agriculture Node', status: 'Healthy', code: 'DB-MH-AGRI', last_sync: '2h ago', speed: '140ms' },
    { name: 'UGC Scholarship Gateway', status: 'Syncing', code: 'UGC-FELLOW', last_sync: 'Just now', speed: '210ms' },
    { name: 'National Scholarship Gateway', status: 'Offline', code: 'NSP-CENTRAL', last_sync: '1d ago', speed: '-' }
  ]);

  const handleManualSync = () => {
    setRunning(true);
    setProgress(10);
    setStatusText('Contacting external central gateways...');
    setSuccess('');

    // Simulate progress ticks
    setTimeout(() => {
      setProgress(40);
      setStatusText('Parsing JSON data payloads...');
    }, 800);

    setTimeout(() => {
      setProgress(75);
      setStatusText('Validating schemas using Pydantic parameters...');
    }, 1600);

    setTimeout(() => {
      setProgress(95);
      setStatusText('Upserting database entries...');
    }, 2400);

    setTimeout(() => {
      setProgress(100);
      setRunning(false);
      setStatusText('Completed');
      setSuccess('Synchronization completed successfully! Recalculated index mappings.');
      
      // Update one provider last sync for realism
      setProviderStatuses(prev => 
        prev.map(p => p.code === 'UGC-FELLOW' ? { ...p, status: 'Healthy', last_sync: 'Just now' } : p)
      );

      setTimeout(() => setSuccess(''), 3000);
    }, 3200);
  };

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
            <RefreshCw size={28} className="text-gov-purple" />
            <span>Synchronization Monitor</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Telemetry metrics of synchronization provider integration pipelines.
          </p>
        </div>

        <Button
          onClick={handleManualSync}
          disabled={running}
          variant="secondary"
          className="bg-gov-purple hover:bg-gov-purple-dark text-white font-bold text-xs"
        >
          <Play size={12} className="fill-current text-gov-green" />
          <span>{running ? 'Running Sync...' : 'Trigger Sync'}</span>
        </Button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold mb-6">
          <CheckCircle2 size={18} className="text-gov-green" />
          <span>{success}</span>
        </div>
      )}

      {/* Progress Telemetry */}
      {running && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">{statusText}</span>
            <span className="font-bold text-gov-purple">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-gradient-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Sync stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-500">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
          <span className="font-bold text-slate-400 block mb-1">SERVICE HEALTH</span>
          <span className="text-sm font-bold text-gov-green flex items-center mt-1">
            <CheckCircle2 size={14} className="mr-1 text-gov-green" />
            Active
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
          <span className="font-bold text-slate-400 block mb-1">NEXT RUN</span>
          <span className="text-sm font-bold text-slate-800 flex items-center mt-1">
            <Clock size={14} className="mr-1 text-gov-purple" />
            Today, 00:00 UTC
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium">
          <span className="font-bold text-slate-400 block mb-1">DATA CHANNELS</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block">4 Active API Nodes</span>
        </div>
      </div>

      {/* Providers list */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium">
        <h3 className="font-extrabold text-sm text-gov-dark mb-6 border-b border-slate-100 pb-2">Active Data Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {providerStatuses.map((p, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 block max-w-[200px] truncate" title={p.name}>{p.name}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                  p.status === 'Healthy' 
                    ? 'bg-emerald-100 text-gov-green' 
                    : p.status === 'Syncing' 
                    ? 'bg-gov-purple-light text-gov-purple' 
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {p.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-semibold border-t border-slate-200/60 pt-2.5">
                <div>
                  <span className="block text-[8px] uppercase">Code</span>
                  <span className="text-slate-700 font-bold">{p.code}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase">Speed</span>
                  <span className="text-slate-700 font-bold">{p.speed}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase">Last Sync</span>
                  <span className="text-slate-700 font-bold">{p.last_sync}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
