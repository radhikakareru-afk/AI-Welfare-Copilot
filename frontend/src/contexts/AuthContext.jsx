import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_CITIZEN_PROFILE = {
  full_name: "Rajesh Kumar",
  age: 30,
  gender: "male",
  annual_income: 120000,
  state: "Maharashtra",
  district: "Pune",
  occupation: "Farmer",
  category: "OBC",
  education: "Secondary Education",
  disability_status: "No",
  address: ""
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('welfare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('welfare_profile');
    return savedProfile ? JSON.parse(savedProfile) : DEFAULT_CITIZEN_PROFILE;
  });

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('welfare_favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const savedRecent = localStorage.getItem('welfare_recently_viewed');
    return savedRecent ? JSON.parse(savedRecent) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('welfare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('welfare_user');
    }
  }, [user]);

  // Synchronize profile, favorites, recently viewed from API when user changes
  useEffect(() => {
    if (!user) {
      setProfile(DEFAULT_CITIZEN_PROFILE);
      setFavorites([]);
      setRecentlyViewed([]);
      localStorage.removeItem('welfare_profile');
      localStorage.removeItem('welfare_favorites');
      localStorage.removeItem('welfare_recently_viewed');
      return;
    }

    const fetchUserData = async () => {
      try {
        const profRes = await api.getProfile(user.id);
        if (profRes.success && profRes.profile) {
          setProfile(profRes.profile);
          localStorage.setItem('welfare_profile', JSON.stringify(profRes.profile));
        }
      } catch (err) {
        console.warn('API error fetching profile:', err.message);
      }

      try {
        const favRes = await api.getFavorites(user.id);
        if (favRes.success && favRes.favorites) {
          const stringIds = favRes.favorites.map(String);
          setFavorites(stringIds);
          localStorage.setItem('welfare_favorites', JSON.stringify(stringIds));
        }
      } catch (err) {
        console.warn('API error fetching favorites:', err.message);
      }

      try {
        const recRes = await api.getRecentlyViewed(user.id);
        if (recRes.success && recRes.recentlyViewed) {
          const stringIds = recRes.recentlyViewed.map(String);
          setRecentlyViewed(stringIds);
          localStorage.setItem('welfare_recently_viewed', JSON.stringify(stringIds));
        }
      } catch (err) {
        console.warn('API error fetching recently viewed:', err.message);
      }
    };

    fetchUserData();
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid email or password' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (email, password, fullName, state, district, verificationToken) => {
    try {
      const res = await api.register(email, password, fullName, state, district, verificationToken);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (updatedDetails) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
      const res = await api.saveProfile(user.id, updatedDetails);
      if (res.success && res.profile) {
        setProfile(res.profile);
        localStorage.setItem('welfare_profile', JSON.stringify(res.profile));
        return { success: true, profile: res.profile };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (err) {
      console.error('Failed to update profile:', err.message);
      return { success: false, error: err.message };
    }
  };

  const toggleFavorite = async (schemeId) => {
    if (!user) return;
    const stringId = String(schemeId);
    const isFav = favorites.includes(stringId);
    
    // Optimistic UI update
    setFavorites(prev => {
      const updated = isFav ? prev.filter(id => id !== stringId) : [...prev, stringId];
      localStorage.setItem('welfare_favorites', JSON.stringify(updated));
      return updated;
    });

    try {
      if (isFav) {
        await api.removeFavorite(user.id, schemeId);
      } else {
        await api.addFavorite(user.id, schemeId);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err.message);
      // Fallback: reload favorites from API on error
      const favRes = await api.getFavorites(user.id);
      if (favRes.success) {
        const stringIds = favRes.favorites.map(String);
        setFavorites(stringIds);
        localStorage.setItem('welfare_favorites', JSON.stringify(stringIds));
      }
    }
  };

  const addRecentlyViewed = async (schemeId) => {
    if (!user) return;
    const stringId = String(schemeId);
    
    // Optimistic UI update
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== stringId);
      const updated = [stringId, ...filtered].slice(0, 5);
      localStorage.setItem('welfare_recently_viewed', JSON.stringify(updated));
      return updated;
    });

    try {
      await api.addRecentlyViewed(user.id, schemeId);
    } catch (err) {
      console.error('Failed to add recently viewed:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      favorites,
      recentlyViewed,
      login,
      register,
      logout,
      updateProfile,
      toggleFavorite,
      addRecentlyViewed
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
