import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAuthToken, getAuthToken } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load current user from token on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setAuthToken(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Auth token verification failed:', err.message);
        // Fallback to cached user if offline
        const cachedUser = localStorage.getItem('cog_care_cached_user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        } else {
          setAuthToken(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('cog_care_cached_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const demoLogin = async (role = 'patient') => {
    setError(null);
    try {
      const data = await apiRequest('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('cog_care_cached_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('cog_care_cached_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('cog_care_cached_user');
  };

  const updateProfile = async (updates) => {
    try {
      const data = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('cog_care_cached_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'guest',
        isAuthenticated: !!user,
        loading,
        error,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
