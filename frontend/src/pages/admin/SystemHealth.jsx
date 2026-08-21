import React from 'react';
import { HeartPulse, Database, Server, Cpu, ShieldAlert } from 'lucide-react';

export default function SystemHealth() {
  const systems = [
    { name: 'FastAPI Backend Engine', status: 'Inactive', detail: 'Mock response framework active', icon: Server, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { name: 'PostgreSQL Database Node', status: 'Inactive', detail: 'Local sandbox storage active', icon: Database, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { name: 'Celery CRON Scheduler', status: 'Inactive', detail: 'Runs inside mock clock thread', icon: Cpu, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' }
  ];

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <HeartPulse size={28} className="text-gov-purple" />
          <span>System Health Telemetry</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Infrastructure health statuses for backend APIs and database nodes.
        </p>
      </div>

      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-amber-950 flex items-start space-x-2 text-xs max-w-xl">
        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-semibold">
          Frontend Development Mode is active. Backend services are bypass-simulated.
        </p>
      </div>

      {/* Health grid list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {systems.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-4 hover-lift transition-all"
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl border ${s.color}`}>
                  <Icon size={20} />
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800">
                  {s.status}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-slate-800">{s.name}</h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{s.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
