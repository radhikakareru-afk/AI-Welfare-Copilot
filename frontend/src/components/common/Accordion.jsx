import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Accordion({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-premium mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 hover:bg-slate-50 transition-all text-sm"
      >
        <span>{title}</span>
        <span className="text-slate-400">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="p-5 pt-0 border-t border-slate-100/60 text-xs text-slate-500 leading-relaxed text-left animate-slide-down">
          {children}
        </div>
      )}
    </div>
  );
}
