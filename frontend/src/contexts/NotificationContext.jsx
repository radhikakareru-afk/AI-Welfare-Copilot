import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(null);

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Welcome to AI Welfare Copilot!",
    message: "Complete your profile to automatically check eligibility for over 100+ state and central welfare schemes.",
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "notif-2",
    title: "Maharashtra loan waiver deadline approaching",
    message: "Shetkari Karjmukti Yojna applications close soon. Ensure your crop loan account is Aadhaar-linked.",
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    deadline_scheme_id: "f401d892-0b1a-4712-a1f9-90656a8dff3e"
  },
  {
    id: "notif-3",
    title: "Ayushman Bharat verification active",
    message: "Empaneled hospitals are now conducting free biometric validation using only your Aadhaar and Ration cards.",
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('welfare_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('welfare_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const addNotification = (title, message, deadline_scheme_id = null) => {
    const newNotif = {
      id: `notif-${Math.random()}`,
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
      deadline_scheme_id
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
