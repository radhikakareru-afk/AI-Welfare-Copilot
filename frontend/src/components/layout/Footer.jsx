import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {/* Logo & Description */}
          <div className="space-y-4 md:col-span-2">
            <span className="font-extrabold text-lg text-white font-sans tracking-tight">
              AI Welfare <span className="text-gov-purple">Copilot</span>
            </span>
            <p className="text-xs leading-relaxed max-w-sm text-slate-500">
              An interactive public welfare service assistant designed to help Indian citizens check criteria eligibility, compare benefits, and follow application steps.
            </p>
            <span className="inline-block px-3 py-1 bg-slate-800 text-[10px] text-slate-400 font-bold rounded-lg border border-slate-700 uppercase tracking-wider">
              Frontend Development Mode - Mock Data Active
            </span>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-gov-green pl-2">Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-gov-green transition-all">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gov-green transition-all">About Us</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-gov-green transition-all">How It Works</Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-gov-green transition-all">Browse Schemes</Link>
              </li>
            </ul>
          </div>

          {/* Legal and Disclaimer */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-gov-purple pl-2 inline-flex items-center space-x-1">
              <ShieldAlert size={14} className="text-gov-purple" />
              <span>Disclaimer</span>
            </h3>
            <p className="text-[10px] leading-relaxed text-slate-500">
              This site is a client-side prototype. It does not perform actual filings, and all calculations are generated using mock profiles. Always consult official ministerial channels.
            </p>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} AI Welfare Copilot. Built with React & Tailwind CSS.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Made with <Heart size={12} className="text-gov-green mx-1 fill-current" /> for digital access in India
          </p>
        </div>
      </div>
    </footer>
  );
}
