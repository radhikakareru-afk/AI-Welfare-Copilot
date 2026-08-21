import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  onClick, 
  disabled = false, 
  className = '', 
  ...props 
}) {
  const baseStyles = 'px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover-lift shrink-0 inline-flex items-center justify-center space-x-1.5 focus:outline-none';
  
  const variants = {
    primary: 'bg-gov-green hover:bg-gov-green-dark text-white shadow-md shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-gov-purple hover:bg-gov-purple-dark text-white shadow-md shadow-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/10 disabled:opacity-50',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
