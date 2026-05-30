import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (firstName, lastName, email, password, confirmPassword) => {
    try {
      setError(null);
      const response = await authService.register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      });

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (err) {
      // Friendly message — handles timeout, network error, server error
      const message =
        err.code === 'ECONNABORTED'
          ? 'Server is waking up, please try again in 30 seconds.'
          : err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);

      // Backend always requires OTP — handle that flow
      if (response.data.requireOTP) {
        return response.data;
      }

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (err) {
      // Friendly message — handles timeout, network error, server error
      const message =
        err.code === 'ECONNABORTED'
          ? 'Server is waking up, please try again in 30 seconds.'
          : err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw err;
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const verifyOTP = async (email, otp) => {
    try {
      setError(null);
      const response = await authService.verifyOTP(email, otp);

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (err) {
      const message =
        err.code === 'ECONNABORTED'
          ? 'Server is waking up, please try again in 30 seconds.'
          : err.response?.data?.message || 'OTP verification failed.';
      setError(message);
      throw err;
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    setError,
    register,
    login,
    verifyOTP,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
