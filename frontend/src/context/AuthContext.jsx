import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('imovies_user');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (err) {
        console.error('Failed to parse auth token', err);
        localStorage.removeItem('imovies_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('imovies_user', JSON.stringify({ user: data.user, token: data.token }));
    }
    return data;
  };

  const register = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('imovies_user', JSON.stringify({ user: data.user, token: data.token }));
    }
    return data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('imovies_user');
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/me', profileData);
    if (data.success) {
      setUser(data.user);
      const stored = JSON.parse(localStorage.getItem('imovies_user') || '{}');
      localStorage.setItem('imovies_user', JSON.stringify({ ...stored, user: data.user, token: data.token || token }));
    }
    return data;
  };

  const isAuthenticated = !!user;
  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

