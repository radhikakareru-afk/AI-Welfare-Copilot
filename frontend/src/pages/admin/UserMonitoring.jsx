import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Search, Users, AlertCircle } from 'lucide-react';

export default function UserMonitoring() {
  const { user: admin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all users on mount
  useEffect(() => {
    if (!admin) return;
    setLoading(true);
    api.getAdminUsers(admin.id)
      .then(res => {
        if (res.success && res.users) {
          // Filter to show only citizen users in user monitoring
          setUsers(res.users.filter(u => u.role === 'citizen'));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin users:', err);
        setError('Failed to fetch user records from database.');
        setLoading(false);
      });
  }, [admin]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const nameStr = u.full_name || '';
      const emailStr = u.email || '';
      const stateStr = u.state || 'N/A';
      const statusStr = u.is_active ? 'Active' : 'Inactive';
      
      const searchStr = `${nameStr} ${emailStr} ${stateStr} ${statusStr}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  const toggleUserStatus = async (userId, currentActive) => {
    if (!admin) return;
    const newStatus = !currentActive;

    // Optimistic UI update
    setUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, is_active: newStatus } : u)
    );

    try {
      const res = await api.updateUserStatus(admin.id, userId, newStatus);
      if (!res.success) {
        // Revert on failure
        setUsers(prev => 
          prev.map(u => u.id === userId ? { ...u, is_active: currentActive } : u)
        );
        alert('Failed to update account status.');
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, is_active: currentActive } : u)
      );
      alert('Error updating user status in database.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <div className="w-12 h-12 border-4 border-gov-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Loading citizen records...</p>
      </div>
    );
  }

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

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-2 text-xs font-semibold mb-6">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

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
                <th className="p-5">User ID</th>
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
                  <tr key={u.id} className="hover:bg-slate-50/40 transition-all">
                    <td className="p-5 font-semibold text-slate-400">#{u.id}</td>
                    <td className="p-5 font-bold text-gov-dark">{u.full_name}</td>
                    <td className="p-5 font-medium text-slate-500">{u.email}</td>
                    <td className="p-5 font-semibold text-slate-700">{u.state || 'N/A'}</td>
                    <td className="p-5 text-slate-450 font-semibold">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                        u.is_active ? 'bg-emerald-100 text-gov-green' : 'bg-slate-150 text-slate-500'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                        className={`text-[10px] font-bold uppercase tracking-wider hover:underline cursor-pointer ${
                          u.is_active ? 'text-rose-600' : 'text-gov-green'
                        }`}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-450">
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
