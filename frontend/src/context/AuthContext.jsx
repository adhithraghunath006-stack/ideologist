import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ideologist_token'));
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('ideologist_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('ideologist_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast(`Account created successfully! Welcome to Ideologist, ${res.user.name}.`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ideologist_token');
    setToken(null);
    setUser(null);
    addToast('You have been logged out safely.', 'info');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        addToast('Profile updated successfully.', 'success');
        return true;
      }
      return false;
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isEntrepreneur: user?.role === 'entrepreneur',
    isInvestor: user?.role === 'investor',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
