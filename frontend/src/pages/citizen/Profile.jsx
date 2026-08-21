import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { calculateAge } from '../../utils/eligibilityEngine';
import { User, MapPin, Briefcase, Award, Edit3, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Profile() {
  const { profile } = useAuth();
  const age = calculateAge(profile.date_of_birth);

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans text-left">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight">Citizen Demographic Profile</h1>
          <p className="mt-2 text-slate-500 text-sm">
            Review demographics used by the rules engine to check welfare compatibility.
          </p>
        </div>
        <Link to="/profile/edit" className="w-full sm:w-auto">
          <Button variant="primary" className="bg-gov-green hover:bg-gov-green-dark w-full">
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Core Profile Card */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: Personal info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User size={16} className="text-gov-green" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">FULL NAME</span>
                <span className="font-semibold text-slate-800 text-sm">{profile.full_name}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">EMAIL</span>
                <span className="font-semibold text-slate-800">{profile.email}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">AGE (CALCULATED)</span>
                <span className="font-semibold text-slate-800">{age} years</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">GENDER</span>
                <span className="font-semibold text-slate-800 capitalize">{profile.gender}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">SOCIAL CATEGORY</span>
                <span className="font-semibold text-slate-800 uppercase">{profile.category}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Socio-Economic */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Briefcase size={16} className="text-gov-purple" />
              <span>Socio-Economic Factors</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">OCCUPATION</span>
                <span className="font-semibold text-slate-800">{profile.occupation}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">ANNUAL FAMILY INCOME</span>
                <span className="font-semibold text-slate-800">₹{profile.annual_income.toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-slate-400 block mb-0.5">EDUCATION LEVEL</span>
                <span className="font-semibold text-slate-800">{profile.education}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Location & vulnerability */}
        <div className="space-y-6 text-xs text-slate-500">
          {/* Location */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-3">
            <h4 className="font-bold text-gov-dark flex items-center space-x-1 border-b border-slate-100 pb-2 mb-1">
              <MapPin size={14} className="text-gov-green" />
              <span>Active Geography</span>
            </h4>
            <div>
              <span className="font-bold text-slate-400 block mb-0.5">STATE</span>
              <span className="font-semibold text-slate-800">{profile.state}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block mb-0.5">DISTRICT</span>
              <span className="font-semibold text-slate-800">{profile.district}</span>
            </div>
          </div>

          {/* Vulnerability */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-3">
            <h4 className="font-bold text-gov-dark flex items-center space-x-1 border-b border-slate-100 pb-2 mb-1">
              <ShieldAlert size={14} className="text-gov-purple" />
              <span>PwD Classification</span>
            </h4>
            <div>
              <span className="font-bold text-slate-400 block mb-0.5">DISABILITY STATUS</span>
              <span className={`font-semibold inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold mt-1 ${
                profile.is_disabled
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {profile.is_disabled ? 'Yes' : 'No'}
              </span>
            </div>
            {profile.is_disabled && (
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">PERCENTAGE</span>
                <span className="font-semibold text-slate-800">{profile.disability_percentage}%</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
