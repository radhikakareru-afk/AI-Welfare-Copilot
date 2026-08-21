import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_CITIZEN_PROFILE = {
  full_name: "Rajesh Kumar",
  date_of_birth: "1994-08-15",
  gender: "male",
  annual_income: 120000,
  state: "Maharashtra",
  district: "Pune",
  occupation: "Farmer",
  category: "OBC",
  education: "Secondary Education",
  is_disabled: false,
  disability_percentage: 0
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

  // Track recently viewed schemes
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

  useEffect(() => {
    localStorage.setItem('welfare_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('welfare_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('welfare_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === 'admin@demo.com' && password === 'Admin@123') {
      const adminUser = { email: cleanEmail, role: 'admin', id: 'admin-uuid-1' };
      setUser(adminUser);
      return { success: true, user: adminUser };
    } 
    
    if (cleanEmail === 'citizen@demo.com' && password === 'Citizen@123') {
      const citizenUser = { email: cleanEmail, role: 'citizen', id: 'citizen-uuid-1' };
      setUser(citizenUser);
      return { success: true, user: citizenUser };
    }

    return { success: false };
  };

  const register = (email, password, fullName, state, district) => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser = { email: cleanEmail, role: 'citizen', id: `citizen-uuid-${Math.random()}` };
    setUser(newUser);
    setProfile({
      ...DEFAULT_CITIZEN_PROFILE,
      full_name: fullName || email.split('@')[0],
      state: state || "Maharashtra",
      district: district || "Pune",
      annual_income: 0
    });
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('welfare_user');
  };

  const updateProfile = (updatedDetails) => {
    setProfile(updatedDetails);
  };

  const toggleFavorite = (schemeId) => {
    setFavorites(prev => {
      if (prev.includes(schemeId)) {
        return prev.filter(id => id !== schemeId);
      } else {
        return [...prev, schemeId];
      }
    });
  };

  const addRecentlyViewed = (schemeId) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== schemeId);
      return [schemeId, ...filtered].slice(0, 5); // Store top 5
    });
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
