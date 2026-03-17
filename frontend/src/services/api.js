import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (data) => {
    return api.post('/auth/register', data);
  },
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  verifyOTP: async (email, otp) => {
    return api.post('/auth/verify-otp', { email, otp });
  },
  getProfile: async () => {
    return api.get('/auth/profile');
  },
  logout: async () => {
    return api.post('/auth/logout');
  },
};

// Admin Services
export const adminService = {
  getDashboardStats: async () => {
    return api.get('/admin/dashboard');
  },
  getAllUsers: async (page = 1, limit = 10) => {
    return api.get(`/admin/users?page=${page}&limit=${limit}`);
  },
  getUserSecurityDetails: async (userId) => {
    return api.get(`/admin/user/${userId}/security`);
  },
  getSecurityAlerts: async (severity = 'all', days = 7) => {
    return api.get(`/admin/alerts?severity=${severity}&days=${days}`);
  },
  getThreatAnalysis: async (days = 30) => {
    return api.get(`/admin/threats?days=${days}`);
  },
  lockUserAccount: async (userId) => {
    return api.post(`/admin/user/${userId}/lock`);
  },
  unlockUserAccount: async (userId) => {
    return api.post(`/admin/user/${userId}/unlock`);
  },
};

export default api;
