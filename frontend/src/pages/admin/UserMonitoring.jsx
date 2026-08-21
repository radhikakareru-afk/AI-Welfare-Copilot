import React, { useState, useMemo } from 'react';
import { MOCK_USERS_LIST } from '../../data/users';
import { Search, Users, ShieldAlert, CheckSquare } from 'lucide-react';

export default function UserMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(MOCK_USERS_LIST);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const searchStr = `${u.name} ${u.email} ${u.state} ${u.status}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  const toggleUserStatus = (email) => {
    setUsers(prev => 
      prev.map(u => u.email === email ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)
    );
  };

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
          <Users size={28} className="text-gov-purple" />
          <span>User Monitoring Console</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          Track citizen registrations, state distribution, and account credentials status.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-premium max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search citizens by name, email, region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-gov-purple focus:bg-white text-xs transition-all"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="p-5">Citizen Name</th>
                <th className="p-5">Email Address</th>
                <th className="p-5">State</th>
                <th className="p-5">Joined Date</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.email} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-5 font-bold text-gov-dark">{u.name}</td>
                    <td className="p-5 font-medium text-slate-500">{u.email}</td>
                    <td className="p-5 font-semibold text-slate-700">{u.state}</td>
                    <td className="p-5 text-slate-450 font-semibold">{u.date}</td>
                    <td className="p-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                        u.status === 'Active' ? 'bg-emerald-100 text-gov-green' : 'bg-slate-150 text-slate-500'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.email)}
                        className={`text-[10px] font-bold uppercase tracking-wider hover:underline cursor-pointer ${
                          u.status === 'Active' ? 'text-rose-600' : 'text-gov-green'
                        }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-450">
                    No citizens match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
