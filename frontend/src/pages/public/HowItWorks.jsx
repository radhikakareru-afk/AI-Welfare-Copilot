import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Settings, 
  Search, 
  FileText, 
  Map, 
  Globe, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Create your profile",
      description: "Sign up and fill out details like age, location, occupation, caste, and annual income. We store this securely in your browser's local sandbox.",
      icon: UserPlus,
      color: "bg-gov-green-light text-gov-green border-gov-green/20"
    },
    {
      step: 2,
      title: "Evaluate criteria eligibility",
      description: "Our rules engine matches your demographics against stored caps, limits, age boundaries, and caste exemptions automatically.",
      icon: Settings,
      color: "bg-gov-purple-light text-gov-purple border-gov-purple/20"
    },
    {
      step: 3,
      title: "Discover matching schemes",
      description: "View matched schemes categorised into 'Fully Eligible' and 'Partially Eligible' (missing minor documents). Check what you qualify for in seconds.",
      icon: Search,
      color: "bg-gov-green-light text-gov-green border-gov-green/20"
    },
    {
      step: 4,
      title: "Understand mandatory documents",
      description: "Read the pre-defined list of certificates, cards, transcripts, or registries required. Ensure you have the certificates ready before filing.",
      icon: FileText,
      color: "bg-gov-purple-light text-gov-purple border-gov-purple/20"
    },
    {
      step: 5,
      title: "Read step-by-step guides",
      description: "Follow clear directions detailing form filling details, block level visits, nodal approvals, and online application inputs.",
      icon: Map,
      color: "bg-gov-green-light text-gov-green border-gov-green/20"
    },
    {
      step: 6,
      title: "Submit on official portals",
      description: "We provide direct redirect buttons to the official ministry, state, or UGC portal pages so you do not get lost on fake websites.",
      icon: Globe,
      color: "bg-gov-purple-light text-gov-purple border-gov-purple/20"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-left">
      
      {/* Header */}
      <div className="mb-16 border-b border-slate-100 pb-6 text-center">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight">How the Platform Works</h1>
        <p className="mt-2 text-slate-500 text-sm max-w-xl mx-auto">
          We simplify welfare scheme discovery by removing complexity. Follow these simple steps to claim your benefits.
        </p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.step}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-premium hover-lift transition-all relative flex items-start space-x-4"
            >
              {/* Step number absolute badge */}
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                #{s.step}
              </div>

              {/* Icon panel */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${s.color}`}>
                <Icon size={22} />
              </div>

              {/* Content */}
              <div className="space-y-1 pr-6">
                <h3 className="font-extrabold text-sm text-gov-dark">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to action */}
      <div className="text-center pt-8">
        <Link
          to="/register"
          className="px-6 py-3 bg-gov-green hover:bg-gov-green-dark text-white font-bold rounded-xl text-xs hover-lift transition-all inline-flex items-center space-x-1.5 shadow-md shadow-emerald-500/10"
        >
          <span>Create Your Citizen Account</span>
          <ChevronRight size={14} />
        </Link>
      </div>

    </div>
  );
}
