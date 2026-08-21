import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'green',
  className = '' 
}) {
  const iconColorMap = {
    green: 'bg-gov-green-light text-gov-green',
    purple: 'bg-gov-purple-light text-gov-purple',
    slate: 'bg-slate-100 text-slate-600',
    red: 'bg-rose-50 text-rose-600'
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-premium flex items-center justify-between hover-lift transition-all text-left ${className}`}>
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{title}</span>
        <span className="text-3xl font-extrabold text-gov-dark block">{value}</span>
        {subtitle && (
          <span className="text-[10px] text-slate-400 block">{subtitle}</span>
        )}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconColorMap[variant] || iconColorMap.green}`}>
          <Icon size={22} className="stroke-[2]" />
        </div>
      )}
    </div>
  );
}
