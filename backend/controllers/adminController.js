import User from '../models/User.js';
import SecurityLog from '../models/SecurityLog.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const lockedAccounts = await User.countDocuments({ accountLocked: true });

    const suspiciousLogins = await SecurityLog.countDocuments({
      eventType: 'login_attempt',
      severity: { $in: ['high', 'critical'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const blockedAttempts = await SecurityLog.countDocuments({
      eventType: 'brute_force_detected',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // Risk distribution
    const riskDistribution = await SecurityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent alerts
    const recentAlerts = await SecurityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'email firstName lastName');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        lockedAccounts,
        suspiciousLogins,
        blockedAttempts,
        riskDistribution,
      },
      recentAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// Get all users with security info
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password -otpCode')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user security details
export const getUserSecurityDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const securityLogs = await SecurityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const loginAttempts = await SecurityLog.countDocuments({
      userId,
      eventType: { $in: ['login_attempt', 'login_failed', 'login_success'] },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const suspiciousActivities = await SecurityLog.countDocuments({
      userId,
      severity: { $in: ['high', 'critical'] },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        devices: user.devices,
        loginHistory: user.loginHistory,
        accountLocked: user.accountLocked,
        failedLoginAttempts: user.failedLoginAttempts,
      },
      securityStats: {
        loginAttempts,
        suspiciousActivities,
        recentSecurityLogs: securityLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get security alerts
export const getSecurityAlerts = async (req, res, next) => {
  try {
    const severity = req.query.severity || 'all';
    const days = parseInt(req.query.days) || 7;

    let query = {
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    };

    if (severity !== 'all') {
      query.severity = severity;
    }

    const alerts = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'email firstName lastName');

    // Aggregate by event type
    const alertsByType = await SecurityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      alerts,
      alertsByType,
      totalAlerts: alerts.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get threat analysis
export const getThreatAnalysis = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Threats by day
    const threatsByDay = await SecurityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          severity: { $in: ['high', 'critical'] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top threat types
    const topThreats = await SecurityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          severity: { $in: ['high', 'critical'] },
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Most targeted users
    const topTargetedUsers = await SecurityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          severity: { $in: ['high', 'critical'] },
        },
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      threatsByDay,
      topThreats,
      topTargetedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// Lock user account
export const lockUserAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    user.accountLocked = true;
    user.accountLockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Log security event
    await SecurityLog.create({
      userId,
      eventType: 'account_locked',
      severity: 'high',
      description: 'Account locked by admin',
      resolvedBy: req.user.id,
      status: 'verified',
    });

    res.status(200).json({
      success: true,
      message: 'User account locked successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Unlock user account
export const unlockUserAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    user.accountLocked = false;
    user.accountLockedUntil = undefined;
    user.failedLoginAttempts = 0;
    await user.save();

    // Log security event
    await SecurityLog.create({
      userId,
      eventType: 'account_locked',
      severity: 'low',
      description: 'Account unlocked by admin',
      resolvedBy: req.user.id,
      status: 'resolved',
    });

    res.status(200).json({
      success: true,
      message: 'User account unlocked successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  getAllUsers,
  getUserSecurityDetails,
  getSecurityAlerts,
  getThreatAnalysis,
  lockUserAccount,
  unlockUserAccount,
};
