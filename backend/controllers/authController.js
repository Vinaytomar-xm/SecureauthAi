import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import SecurityLog from '../models/SecurityLog.js';
import { sendOTPEmail, sendSecurityAlertEmail } from '../utils/emailService.js';
import {
  calculateRiskScore,
  getRiskLevel,
  getRiskAction,
  isNewDevice,
  isNewLocation,
  isUnusualLoginTime,
  checkRapidLocationChange,
} from '../utils/riskScoring.js';
import {
  extractDeviceInfo,
  getLocationFromIP,
  getClientIP,
  generateOTP,
  isVPNorProxy,
} from '../utils/deviceDetection.js';

dotenv.config();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ── Register ──────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName) return res.status(400).json({ success: false, message: 'Please provide first name' });
    if (!lastName) return res.status(400).json({ success: false, message: 'Please provide last name' });
    if (!email) return res.status(400).json({ success: false, message: 'Please provide email' });
    if (!password) return res.status(400).json({ success: false, message: 'Please provide password' });
    if (!confirmPassword) return res.status(400).json({ success: false, message: 'Please confirm password' });

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ firstName, lastName, email, password });
    const token = generateToken(user._id, user.role);

    await SecurityLog.create({
      userId: user._id,
      eventType: 'account_created',
      severity: 'low',
      description: 'New account created',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // LOGIN ONLY needs email + password — no firstName/lastName
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isAccountLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked. Please try again later.',
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      await user.incrementFailedAttempts();
      await SecurityLog.create({
        userId: user._id,
        eventType: 'login_failed',
        severity: 'low',
        description: 'Failed login - incorrect password',
        ipAddress: getClientIP(req),
        status: 'detected',
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        attemptsRemaining: Math.max(0, 5 - (user.failedLoginAttempts + 1)),
      });
    }

    // ── Gather device/location info ───────────────────────────────────────────
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceInfo = extractDeviceInfo(userAgent);
    const ipAddress = getClientIP(req);
    const location = getLocationFromIP(ipAddress);
    const vpnDetected = isVPNorProxy(ipAddress);

    const riskFactors = {
      failedAttempts: user.failedLoginAttempts,
      isNewDevice: isNewDevice(user, deviceInfo.deviceId),
      isNewLocation: isNewLocation(user, location),
      isUnusualTime: isUnusualLoginTime(user),
      geographicAnomalySuspicious: false,
      rapidLocationChange: false,
      phishingDetected: false,
      vpnDetected,
      torDetected: false,
      userAgentMismatch: false,
    };

    if (user.loginHistory.length > 0) {
      const last = user.loginHistory[user.loginHistory.length - 1];
      riskFactors.rapidLocationChange = checkRapidLocationChange(last.location, location);
    }

    const riskScore = calculateRiskScore(riskFactors);
    const riskLevel = getRiskLevel(riskScore);
    const riskAction = getRiskAction(riskLevel);

    await user.recordLogin({ ipAddress, deviceId: deviceInfo.deviceId, deviceName: deviceInfo.deviceName, location, riskScore, riskLevel, success: true });
    await user.addDevice({ ...deviceInfo, ipAddress, location });
    await user.resetFailedAttempts();

    await SecurityLog.create({
      userId: user._id,
      eventType: 'login_success',
      severity: riskLevel === 'low' ? 'low' : 'medium',
      riskScore,
      description: `Login successful - Risk: ${riskLevel}`,
      ipAddress,
      deviceInfo,
      location,
      status: 'verified',
    });

    // ── Generate + send OTP ───────────────────────────────────────────────────
    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    try {
      await sendOTPEmail(email, otp, user.firstName);
    } catch (emailError) {
      console.error('[Email] OTP send failed:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    if (riskAction.notifyUser || vpnDetected) {
      try {
        await sendSecurityAlertEmail(email, user.firstName, {
          type: riskLevel === 'critical' ? 'Unusual Login Detected' : 'Verification Needed',
          location: location?.city || 'Unknown',
          riskLevel: riskLevel.toUpperCase(),
          isUnauthorizedNetwork: vpnDetected,
          riskScore,
        });
      } catch (e) {
        console.error('[Email] Alert failed:', e.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete login.',
      requireOTP: true,
      riskLevel,
      riskScore,
      isUnauthorizedNetwork: vpnDetected,
    });
  } catch (error) {
    next(error);
  }
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email }).select('+otpCode');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please login again.' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    await SecurityLog.create({
      userId: user._id,
      eventType: 'otp_verified',
      severity: 'low',
      description: 'OTP verified successfully',
      status: 'verified',
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Profile ───────────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        devices: user.devices,
        loginHistory: user.loginHistory.slice(-10).reverse(),
        failedLoginAttempts: user.failedLoginAttempts,
        accountLocked: user.accountLocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Same response — prevents email enumeration
      return res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp, user.firstName);

    res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email }).select('+otpCode');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.otpCode || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    if (user.otpCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.password = await bcryptjs.hash(newPassword, 10);
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.lastPasswordChange = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isCorrect = await user.matchPassword(oldPassword);
    if (!isCorrect) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcryptjs.hash(newPassword, 10);
    user.lastPasswordChange = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
