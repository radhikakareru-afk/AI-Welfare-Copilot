import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, FileText, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <span className="font-extrabold text-lg text-white font-sans tracking-tight">
              AI Welfare <span className="text-gov-saffron">Copilot</span>
            </span>
            <p className="text-xs leading-relaxed max-w-sm text-slate-500">
              Empowering Indian citizens by making welfare schemes searchable, comparable, and eligibility-transparent using advanced rules mapping.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schemes" className="hover:text-gov-saffron transition-all">
                  Browse Schemes
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-gov-saffron transition-all">
                  Compare Benefits
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-gov-saffron transition-all">
                  Eligibility Assessment
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal and Disclaimer */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 inline-flex items-center space-x-1.5">
              <ShieldAlert size={14} className="text-gov-saffron" />
              <span>Disclaimer</span>
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-500">
              This platform is an AI-powered simulation welfare engine. In production scenarios, always verify registration dates, final forms, and terms on official central and state ministry portals.
            </p>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} AI Welfare Copilot. Built as a high-quality SaaS portfolio project.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Made with <Heart size={12} className="text-rose-500 mx-1 fill-rose-500" /> for digital literacy in India
          </p>
        </div>
      </div>
    </footer>
  );
}
