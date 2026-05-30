import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserSecurityDetails,
  getSecurityAlerts,
  getThreatAnalysis,
  lockUserAccount,
  unlockUserAccount,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/user/:userId/security', getUserSecurityDetails);

// Security
router.get('/alerts', getSecurityAlerts);
router.get('/threats', getThreatAnalysis);

// User management
router.post('/user/:userId/lock', lockUserAccount);
router.post('/user/:userId/unlock', unlockUserAccount);

export default router;
