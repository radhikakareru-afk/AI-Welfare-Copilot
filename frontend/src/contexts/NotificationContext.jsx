import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const res = await api.getNotifications(user.id);
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications from API:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    try {
      await api.markNotificationAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
      fetchNotifications(); // Reload on failure
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );

    try {
      await api.markAllNotificationsAsRead(user.id);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err.message);
      fetchNotifications(); // Reload on failure
    }
  };

  const addNotification = (title, message, deadline_scheme_id = null) => {
    // Dummy handler for compatibility - notifications are mainly created server-side in DB
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
      addNotification,
      refreshNotifications: fetchNotifications
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
