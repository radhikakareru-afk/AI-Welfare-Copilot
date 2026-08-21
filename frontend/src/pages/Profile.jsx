import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, Briefcase, Award, AlertCircle, Save, Sparkles } from 'lucide-react';

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Local state initialized with context values
  const [formData, setFormData] = useState({ ...profile });
  const [savedMessage, setSavedMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'annual_income' || name === 'disability_percentage' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedMessage('Profile saved successfully! Recalculating eligibility...');
    
    // Simulate engine run
    setTimeout(() => {
      setSavedMessage('');
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      
      {/* Title */}
      <div className="mb-10 flex justify-between items-start flex-col sm:flex-row sm:items-center gap-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight">Citizen Demographic Profile</h1>
          <p className="mt-2 text-slate-500 text-sm">
            Keep your profile details up-to-date. The eligibility engine evaluates these metrics to determine scheme qualification.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold mb-6 animate-pulse">
          <Sparkles size={18} className="text-gov-green" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Card 1: Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-gov-saffron" />
            <span>1. Personal & Demographics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="transgender">Transgender</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Social Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Socio-Economic Metrics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Briefcase size={18} className="text-gov-saffron" />
            <span>2. Socio-Economic Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Annual Income */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Annual Family Income (₹)</label>
              <input
                type="number"
                name="annual_income"
                value={formData.annual_income}
                onChange={handleChange}
                required
                min="0"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Occupation</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm"
              >
                <option value="Farmer">Farmer</option>
                <option value="Agricultural Worker">Agricultural Worker</option>
                <option value="Labourer">Labourer</option>
                <option value="Maid">Maid / Domestic worker</option>
                <option value="Street Vendor">Street Vendor</option>
                <option value="Rickshaw Puller">Rickshaw Puller</option>
                <option value="Construction Worker">Construction Worker</option>
                <option value="Student">Student</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Driver">Driver</option>
                <option value="Artisan">Artisan</option>
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Education Status</label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm"
              >
                <option value="No Formal Education">No Formal Education</option>
                <option value="Primary Education">Primary Education</option>
                <option value="Secondary Education">Secondary Education (Class 10th)</option>
                <option value="Higher Secondary">Higher Secondary (Class 12th)</option>
                <option value="Diploma">Diploma Course</option>
                <option value="Undergraduate">Undergraduate Degree</option>
                <option value="Postgraduate">Postgraduate Degree</option>
                <option value="Ph.D">Ph.D / Research scholar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Location and Vulnerability */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3">
            <MapPin size={18} className="text-gov-saffron" />
            <span>3. Geography & Vulnerability</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State of Residence</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Delhi">Delhi</option>
                <option value="Kerala">Kerala</option>
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm"
              />
            </div>

            {/* Disability Toggle */}
            <div className="flex flex-col justify-end">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-gov-dark">Disabled Status (PwD)</span>
                  <span className="text-[10px] text-slate-400">Requires medical certificate</span>
                </div>
                <input
                  type="checkbox"
                  name="is_disabled"
                  checked={formData.is_disabled}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-gov-saffron focus:ring-gov-saffron h-4 w-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Disability Percentage */}
            {formData.is_disabled && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Disability Percentage (%)</label>
                <input
                  type="number"
                  name="disability_percentage"
                  value={formData.disability_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:bg-white text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-4 bg-gradient-saffron hover:shadow-lg hover:shadow-orange-500/20 text-white font-bold rounded-xl hover-lift transition-all inline-flex items-center space-x-2"
          >
            <Save size={18} />
            <span>Save Profile & Check Eligibility</span>
          </button>
        </div>
      </form>
    </div>
  );
}
