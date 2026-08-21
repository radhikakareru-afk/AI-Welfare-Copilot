import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STATES_LIST, OCCUPATIONS_LIST, CATEGORIES_LIST, EDUCATIONS_LIST } from '../../data/users';
import { ArrowLeft, Save, Sparkles, User, Briefcase, MapPin, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function EditProfile() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ ...profile });
  const [success, setSuccess] = useState('');

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
    setSuccess('Demographics saved successfully! Re-routing...');
    
    setTimeout(() => {
      setSuccess('');
      navigate('/profile');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          to="/profile" 
          className="inline-flex items-center text-slate-500 hover:text-gov-dark font-semibold text-xs uppercase tracking-wider transition-all"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Back to Profile
        </Link>
      </div>

      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight">Edit Profile Demographics</h1>
        <p className="mt-2 text-slate-500 text-sm">
          Modify your attributes. Saving triggers real-time eligibility recalibration.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold mb-6 animate-pulse">
          <Sparkles size={18} className="text-gov-green" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1: Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-gov-green" />
            <span>1. Personal & Demographics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                label="Date of Birth"
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="transgender">Transgender</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Social Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-sm"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Socio-Economic */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Briefcase size={18} className="text-gov-purple" />
            <span>2. Socio-Economic Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <Input
                label="Annual Family Income (₹)"
                id="annual_income"
                name="annual_income"
                type="number"
                value={formData.annual_income}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Occupation</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-sm"
              >
                {OCCUPATIONS_LIST.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Education Status</label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-sm"
              >
                {EDUCATIONS_LIST.map((edu) => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Location and Vulnerability */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium space-y-6">
          <h3 className="font-extrabold text-base text-gov-dark flex items-center space-x-2 border-b border-slate-100 pb-3">
            <MapPin size={18} className="text-gov-green" />
            <span>3. Geography & Vulnerability</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State of Residence</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-sm"
              >
                {STATES_LIST.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="District"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-gov-dark">Disabled Status (PwD)</span>
                  <span className="text-[10px] text-slate-400">Requires certificate</span>
                </div>
                <input
                  type="checkbox"
                  name="is_disabled"
                  checked={formData.is_disabled}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-gov-purple focus:ring-gov-purple h-4 w-4 cursor-pointer"
                />
              </div>
            </div>

            {formData.is_disabled && (
              <div>
                <Input
                  label="Disability Percentage (%)"
                  id="disability_percentage"
                  name="disability_percentage"
                  type="number"
                  value={formData.disability_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary" className="bg-gov-green hover:bg-gov-green-dark">
            <Save size={16} />
            <span>Save Profile</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
