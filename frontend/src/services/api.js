import axios from 'axios';

// BUG FIX: VITE_API_URL must be set on Vercel as an env variable
// pointing to https://secureauth-backend-85f6.onrender.com/api
// Without this, all API calls go to vercel.app/api → 404
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // BUG FIX: required when backend uses credentials: true in CORS
  timeout: 15000,        // 15s timeout — Render free tier can be slow on cold start
});

// ── Request interceptor — attach JWT ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Surface a clean error message for the UI
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. The server may be starting up — please try again.' : null) ||
      (error.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : null) ||
      'An unexpected error occurred.';

    error.displayMessage = message;
    return Promise.reject(error);
  }
);

// ── Auth Services ─────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ── Admin Services ────────────────────────────────────────────
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: (page = 1, limit = 10) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  getUserSecurityDetails: (userId) => api.get(`/admin/user/${userId}/security`),
  getSecurityAlerts: (severity = 'all', days = 7) => api.get(`/admin/alerts?severity=${severity}&days=${days}`),
  getThreatAnalysis: (days = 30) => api.get(`/admin/threats?days=${days}`),
  lockUserAccount: (userId) => api.post(`/admin/user/${userId}/lock`),
  unlockUserAccount: (userId) => api.post(`/admin/user/${userId}/unlock`),
};

export default api;
