import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Lock, User, Save, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Account');
  const [success, setSuccess] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess('Settings updated successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const tabs = [
    { name: 'Account', icon: User },
    { name: 'Password', icon: Lock },
    { name: 'Preferences', icon: Bell },
    { name: 'Privacy', icon: Shield }
  ];

  return (
    <div className="space-y-8 font-sans text-left max-w-4xl">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <SettingsIcon size={28} className="text-gov-purple" />
          <span>Account Settings</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Manage your account credentials, security setups, and notifications alerts preferences.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold mb-6 animate-pulse">
          <Sparkles size={18} className="text-gov-green" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider space-x-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.name}
              onClick={() => setActiveTab(t.name)}
              className={`pb-3 transition-all cursor-pointer inline-flex items-center space-x-1.5 ${
                activeTab === t.name 
                  ? 'border-b-2 border-gov-purple text-gov-purple font-extrabold' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={14} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Forms */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-premium max-w-xl space-y-6">
        
        {activeTab === 'Account' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-gov-dark mb-4 uppercase tracking-wider border-b border-slate-150 pb-1.5">Account Details</h3>
            <Input
              label="Contact Mobile"
              id="mobile"
              type="text"
              defaultValue="+91 98765 43210"
              placeholder="+91 12345 67890"
            />
            <Input
              label="Recovery Email"
              id="recovery_email"
              type="email"
              defaultValue="rajesh.recovery@example.com"
              placeholder="recovery@example.com"
            />
          </div>
        )}

        {activeTab === 'Password' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-gov-dark mb-4 uppercase tracking-wider border-b border-slate-150 pb-1.5">Change Password</h3>
            <Input
              label="Current Password"
              id="current_pass"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="New Password"
              id="new_pass"
              type="password"
              placeholder="At least 6 characters"
            />
            <Input
              label="Confirm New Password"
              id="confirm_new_pass"
              type="password"
              placeholder="Repeat your password"
            />
          </div>
        )}

        {activeTab === 'Preferences' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-gov-dark mb-4 uppercase tracking-wider border-b border-slate-150 pb-1.5">Notification Toggles</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-350 text-gov-purple focus:ring-gov-purple h-4 w-4" />
                <span className="font-semibold text-slate-700">Receive SMS notifications on matching schemes</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-350 text-gov-purple focus:ring-gov-purple h-4 w-4" />
                <span className="font-semibold text-slate-700">Email reminders for upcoming deadlines</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-350 text-gov-purple focus:ring-gov-purple h-4 w-4" />
                <span className="font-semibold text-slate-700">Weekly sync audit reports (Admin only)</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'Privacy' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-gov-dark mb-4 uppercase tracking-wider border-b border-slate-150 pb-1.5">Privacy & Consents</h3>
            <p className="text-slate-500 leading-relaxed">
              We process demographic inputs locally in your sandboxed browser space during development. No central profiling occurs.
            </p>
            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-350 text-gov-purple focus:ring-gov-purple h-4 w-4" />
                <span className="font-semibold text-slate-700">Share anonymous diagnostic statistics</span>
              </label>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button type="submit" variant="primary" className="bg-gov-green hover:bg-gov-green-dark">
            <Save size={14} />
            <span>Save Preferences</span>
          </Button>
        </div>

      </form>
    </div>
  );
}
