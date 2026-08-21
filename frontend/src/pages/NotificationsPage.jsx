import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, Check, Clock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-left">
      {/* Back to dashboard */}
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-slate-500 hover:text-gov-dark font-semibold text-sm transition-all"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gov-dark tracking-tight flex items-center space-x-2">
            <Bell size={28} className="text-gov-saffron" />
            <span>Notifications Center</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Stay updated with upcoming application deadlines and rule synchronization logs.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-sm"
          >
            <Check size={14} />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 ${
                notif.is_read
                  ? 'bg-white border-slate-200 opacity-70'
                  : 'bg-orange-50/40 border-orange-200/60 shadow-sm'
              }`}
            >
              {/* Unread dot indicator */}
              {!notif.is_read && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gov-saffron"></div>
              )}

              <div className="space-y-1.5 pr-4">
                <h4 className="font-extrabold text-sm text-gov-dark flex items-center space-x-2">
                  <span>{notif.title}</span>
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-gov-saffron rounded-full"></span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  {notif.message}
                </p>
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold uppercase">
                  <Clock size={12} />
                  <span>
                    {new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at{' '}
                    {new Date(notif.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action buttons mapping to schemes */}
              {notif.deadline_scheme_id && (
                <Link
                  to={`/schemes/${notif.deadline_scheme_id}`}
                  className="px-4 py-2 bg-gov-saffron hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shrink-0 inline-flex items-center space-x-1 shadow-md shadow-orange-500/10"
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
          <h3 className="text-lg font-bold text-gov-dark mb-1">Inboxes Clear</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You don't have any notifications or deadline reminders currently.
          </p>
        </div>
      )}
    </div>
  );
}
