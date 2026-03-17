import User from '../models/User.js';
import SecurityLog from '../models/SecurityLog.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { sendOTPEmail, sendSecurityAlertEmail } from '../utils/emailService.js';
import {
  calculateRiskScore,
  getRiskLevel,
  getRiskAction,
  detectPhishing,
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

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register Controller
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    // Log security event
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
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login Controller with Risk Assessment
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide email and password' });
    }

    // Get user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      await SecurityLog.create({
        userId: user._id,
        eventType: 'login_attempt',
        severity: 'medium',
        description: 'Login attempt on locked account',
        ipAddress: getClientIP(req),
        status: 'detected',
      });

      return res.status(423).json({
        success: false,
        message:
          'Account temporarily locked due to multiple failed login attempts. Please try again later.',
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      await user.incrementFailedAttempts();

      await SecurityLog.create({
        userId: user._id,
        eventType: 'login_failed',
        severity: 'low',
        description: 'Failed login attempt - incorrect password',
        ipAddress: getClientIP(req),
        status: 'detected',
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        attemptsRemaining: Math.max(0, 5 - user.failedLoginAttempts),
      });
    }

    // Extract device and location info
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceInfo = extractDeviceInfo(userAgent);
    const ipAddress = getClientIP(req);
    const location = getLocationFromIP(ipAddress);

    // Calculate risk score
    const riskFactors = {
      failedAttempts: 0,
      isNewDevice: isNewDevice(user, deviceInfo.deviceId),
      isNewLocation: isNewLocation(user, location),
      isUnusualTime: isUnusualLoginTime(user),
      geographicAnomalySuspicious: false,
      rapidLocationChange: false,
      phishingDetected: false,
      vpnDetected: false,
      torDetected: false,
      userAgentMismatch: false,
    };

    // Check for rapid location change
    if (user.loginHistory.length > 0) {
      const lastLogin = user.loginHistory[user.loginHistory.length - 1];
      riskFactors.rapidLocationChange = checkRapidLocationChange(
        lastLogin.location,
        location
      );
    }

    const riskScore = calculateRiskScore(riskFactors);
    const riskLevel = getRiskLevel(riskScore);
    const riskAction = getRiskAction(riskLevel);

    // Record the login attempt
    await user.recordLogin({
      ipAddress,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      location,
      riskScore,
      riskLevel,
      success: true,
    });

    // Add/update device
    await user.addDevice({
      ...deviceInfo,
      ipAddress,
      location,
    });

    // Reset failed attempts
    await user.resetFailedAttempts();

    // Log security event
    await SecurityLog.create({
      userId: user._id,
      eventType: 'login_success',
      severity: riskLevel === 'low' ? 'low' : 'medium',
      riskScore,
      description: `Login successful - Risk Level: ${riskLevel}`,
      ipAddress,
      deviceInfo,
      location,
      status: 'verified',
    });

    // Check for unauthorized network (VPN, Proxy, etc.)
    const isUnauthorizedNetwork = await isVPNorProxy(ipAddress);
    if (isUnauthorizedNetwork) {
      riskScore += 10; // VPN detected
      riskFactors.push('unauthorized_network_detected');
    }

    // Determine if OTP is needed
    // REQUIRE OTP FOR EVERY LOGIN
    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.firstName);

    // Send alert email if high risk
    if (riskAction.notifyUser || isUnauthorizedNetwork) {
      await sendSecurityAlertEmail(email, user.firstName, {
        type: riskLevel === 'critical' ? 'Unusual Login Detected' : 'Verification Needed',
        location: location.city,
        riskLevel: riskLevel.toUpperCase(),
        isUnauthorizedNetwork: isUnauthorizedNetwork,
        riskScore: riskScore,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete login.',
      requireOTP: true,
      riskLevel,
      riskScore,
      isUnauthorizedNetwork,
      riskFactors,
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP Controller
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email }).select('+otpCode');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Check if OTP is expired
    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: 'OTP has expired' });
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid OTP' });
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Log security event
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
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('devices loginHistory');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        devices: user.devices,
        loginHistory: user.loginHistory.slice(-10),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.firstName);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password with OTP
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.otpCode !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Change Password (logged in)
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordCorrect = await user.matchPassword(oldPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  verifyOTP,
  getProfile,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};