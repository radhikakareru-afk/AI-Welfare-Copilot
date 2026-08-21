import React from 'react';

export default function Input({ 
  label, 
  id, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  className = '', 
  icon: Icon,
  ...props 
}) {
  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`block w-full ${
            Icon ? 'pl-9' : 'pl-3'
          } pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-sm transition-all ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
