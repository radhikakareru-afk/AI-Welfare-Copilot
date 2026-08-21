import React from 'react';
import { Link } from 'react-router-dom';
import { Info, ShieldAlert, Award, Compass } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-left">
      
      {/* Page Header */}
      <div className="mb-12 border-b border-slate-100 pb-6 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight">About AI Welfare Copilot</h1>
        <p className="mt-2 text-slate-500 text-sm">
          Bridging the gap between government benefits and the citizens who need them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main descriptions */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-premium">
            <h3 className="font-extrabold text-base text-gov-dark mb-3 inline-flex items-center space-x-2">
              <ShieldAlert size={18} className="text-gov-green" />
              <span>The Problem We Solve</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every year, the Government of India releases thousands of crores in funding for social security, education subsidies, farming inputs, and healthcare assistance. However, a significant portion of this goes unclaimed. 
              <br /><br />
              Information is fragmented across hundreds of ministries and state portals, eligibility guidelines are dense and complicated, and citizens often do not realize which schemes match their demographic profile.
            </p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-premium">
            <h3 className="font-extrabold text-base text-gov-dark mb-3 inline-flex items-center space-x-2">
              <Award size={18} className="text-gov-purple" />
              <span>Our Mission</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our mission is to establish a transparent, rules-based lookup engine that connects citizens with benefits in seconds. By normalizing government criteria into a structured database schema and creating a client-side copilot, we remove the friction of discovery.
            </p>
          </section>
        </div>

        {/* Vision details sidebar */}
        <div className="space-y-6">
          <div className="bg-gov-purple-light p-6 rounded-2xl border border-gov-purple/20 space-y-4">
            <h4 className="font-bold text-sm text-gov-purple-dark flex items-center space-x-1.5">
              <Compass size={16} />
              <span>Core Vision</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              We envision an India where welfare schemes are accessible to all, regardless of tech literacy. In the future, this portal will integrate conversational AI interfaces to let citizens discover qualifications via simple voice commands.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium text-xs text-slate-500">
            <h4 className="font-bold text-gov-dark mb-3">Who Can Benefit</h4>
            <ul className="space-y-2 list-disc pl-4">
              <li>Farmers looking for input support</li>
              <li>Students requiring post-matric scholarships</li>
              <li>Unorganized laborers seeking social security</li>
              <li>Disabled scholars pursuing research grants</li>
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  );
}
