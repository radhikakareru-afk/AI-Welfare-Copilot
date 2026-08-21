import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, Check, Clock, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('All');

  // Filter notifications by category
  const filteredNotifications = useMemo(() => {
    if (filter === 'All') return notifications;
    return notifications.filter(n => n.category === filter);
  }, [notifications, filter]);

  return (
    <div className="space-y-8 font-sans text-left max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
            <Bell size={28} className="text-gov-purple" />
            <span>Notifications Center</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Review updates on system health, synchronized deadlines, or scheme rule changes.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check size={14} />
            <span>Mark All Read</span>
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider space-x-6">
        {['All', 'Scheme Updates', 'Deadlines', 'System'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`pb-3 transition-all cursor-pointer ${
              filter === cat 
                ? 'border-b-2 border-gov-purple text-gov-purple font-extrabold' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 ${
                notif.is_read
                  ? 'bg-white border-slate-200 opacity-70'
                  : 'bg-purple-50/20 border-purple-200/50 shadow-sm'
              }`}
            >
              {!notif.is_read && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gov-purple"></div>
              )}

              <div className="space-y-1.5 pr-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-widest ${
                    notif.category === 'Deadlines'
                      ? 'bg-rose-100 text-rose-700'
                      : notif.category === 'Scheme Updates'
                      ? 'bg-purple-100 text-gov-purple-dark'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {notif.category || 'System'}
                  </span>
                  <h4 className="font-bold text-sm text-gov-dark leading-snug">{notif.title}</h4>
                </div>
                
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                  {notif.message}
                </p>

                <div className="flex items-center space-x-1 text-[9px] text-slate-450 font-semibold uppercase">
                  <Clock size={11} />
                  <span>
                    {new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              {notif.deadline_scheme_id && (
                <Link
                  to={`/schemes/${notif.deadline_scheme_id}`}
                  className="px-4 py-2 bg-gov-green hover:bg-gov-green-dark text-white rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center space-x-1 shadow-md shadow-emerald-500/10"
                >
                  <span>Apply Now</span>
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-premium">
          <Bell size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-sm font-bold text-gov-dark mb-1">No Notifications</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You do not have any notifications matching this filter currently.
          </p>
        </div>
      )}
    </div>
  );
}
