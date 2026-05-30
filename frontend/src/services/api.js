import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 60000, // 60 seconds — handles Render free tier cold start (takes 30-60s to wake up)
});

// ── Attach JWT to every request ───────────────────────────────────────────────
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

// ── Handle errors globally ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Attach friendly message for UI
    if (error.code === 'ECONNABORTED') {
      error.displayMessage = 'Server is waking up, please try again in 30 seconds.';
    } else if (error.message === 'Network Error') {
      error.displayMessage = 'Cannot reach the server. Check your connection.';
    } else {
      error.displayMessage = error.response?.data?.message || 'Something went wrong.';
    }

    return Promise.reject(error);
  }
);

// ── Auth Services ─────────────────────────────────────────────────────────────
export const authService = {
  register: async (data) => api.post('/auth/register', data),
  login: async (email, password) => api.post('/auth/login', { email, password }),
  verifyOTP: async (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  getProfile: async () => api.get('/auth/profile'),
  logout: async () => api.post('/auth/logout'),
  forgotPassword: async (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: async (data) => api.post('/auth/reset-password', data),
  changePassword: async (data) => api.post('/auth/change-password', data),
};

// ── Admin Services ────────────────────────────────────────────────────────────
export const adminService = {
  getDashboardStats: async () => api.get('/admin/dashboard'),
  getAllUsers: async (page = 1, limit = 10) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),
  getUserSecurityDetails: async (userId) =>
    api.get(`/admin/user/${userId}/security`),
  getSecurityAlerts: async (severity = 'all', days = 7) =>
    api.get(`/admin/alerts?severity=${severity}&days=${days}`),
  getThreatAnalysis: async (days = 30) =>
    api.get(`/admin/threats?days=${days}`),
  lockUserAccount: async (userId) =>
    api.post(`/admin/user/${userId}/lock`),
  unlockUserAccount: async (userId) =>
    api.post(`/admin/user/${userId}/unlock`),
};

export default api;
