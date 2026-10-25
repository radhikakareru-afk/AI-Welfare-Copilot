import React, { useState, useEffect } from 'react';
import { HeartPulse, Database, Server, Cpu, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function SystemHealth() {
  const [dbStatus, setDbStatus] = useState({ loading: true, active: false, detail: 'Checking connection...' });
  const [flaskStatus, setFlaskStatus] = useState({ loading: true, active: false, detail: 'Checking connection...' });

  useEffect(() => {
    // Probe Express + DB
    api.testDb()
      .then(res => {
        if (res.success) {
          setDbStatus({ loading: false, active: true, detail: 'PostgreSQL database connected (Port 5432)' });
        } else {
          setDbStatus({ loading: false, active: false, detail: res.message || 'Connection failed' });
        }
      })
      .catch(err => {
        setDbStatus({ loading: false, active: false, detail: 'Express API unreachable' });
      });

    // Probe Flask + DB
    api.testAuthDb()
      .then(res => {
        if (res.success) {
          setFlaskStatus({ loading: false, active: true, detail: 'Flask OTP & auth service online (Port 5001)' });
        } else {
          setFlaskStatus({ loading: false, active: false, detail: res.message || 'Auth service degraded' });
        }
      })
      .catch(err => {
        setFlaskStatus({ loading: false, active: false, detail: 'Flask Auth service unreachable' });
      });
  }, []);

  const systems = [
    { 
      name: 'Python Flask Auth Engine', 
      status: flaskStatus.loading ? 'Checking...' : (flaskStatus.active ? 'Active' : 'Offline'), 
      detail: flaskStatus.detail, 
      icon: Server, 
      color: flaskStatus.active 
        ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' 
        : 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      badgeColor: flaskStatus.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
    },
    { 
      name: 'PostgreSQL Database Node', 
      status: dbStatus.loading ? 'Checking...' : (dbStatus.active ? 'Active' : 'Offline'), 
      detail: dbStatus.detail, 
      icon: Database, 
      color: dbStatus.active 
        ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' 
        : 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      badgeColor: dbStatus.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
    },
    { 
      name: 'Core Express Backend Engine', 
      status: dbStatus.loading ? 'Checking...' : (dbStatus.active ? 'Active' : 'Offline'), 
      detail: 'Core REST API operational (Port 5000)', 
      icon: Cpu, 
      color: dbStatus.active 
        ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' 
        : 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      badgeColor: dbStatus.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
    }
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

      <div className={`${dbStatus.active && flaskStatus.active ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-amber-50/50 border-amber-200 text-amber-950'} p-4 rounded-xl border flex items-start space-x-2 text-xs max-w-xl`}>
        {dbStatus.active && flaskStatus.active ? (
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        )}
        <p className="leading-relaxed font-semibold">
          {dbStatus.active && flaskStatus.active
            ? 'All microservices and database connections are operational and synchronized.'
            : 'Connecting to background telemetry services...'}
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
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${s.badgeColor}`}>
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
