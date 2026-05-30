import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      trim: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: Date,
    // Security Fields
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    accountLockedUntil: Date,
    // Device & Location Tracking
    devices: [
      {
        deviceId: String,
        deviceName: String,
        deviceType: String,
        browser: String,
        osType: String,
        ipAddress: String,
        location: {
          country: String,
          city: String,
          latitude: Number,
          longitude: Number,
        },
        lastLogin: Date,
        isVerified: {
          type: Boolean,
          default: false,
        },
        addedDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Login History
    loginHistory: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ipAddress: String,
        deviceId: String,
        deviceName: String,
        location: {
          country: String,
          city: String,
        },
        riskScore: Number,
        riskLevel: String,
        success: Boolean,
        reason: String,
      },
    ],
    // OTP Fields
    otpCode: {
      type: String,
      select: false,
    },
    otpExpires: Date,
    // Security Settings
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    trustedDevices: [String],
    // User Role
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastPasswordChange: Date,
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    this.lastPasswordChange = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to increment failed login attempts
userSchema.methods.incrementFailedAttempts = function () {
  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= 5) {
    this.accountLocked = true;
    this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }

  return this.save();
};

// Method to reset failed attempts
userSchema.methods.resetFailedAttempts = function () {
  this.failedLoginAttempts = 0;
  this.accountLocked = false;
  this.accountLockedUntil = undefined;
  return this.save();
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function () {
  if (
    this.accountLocked &&
    this.accountLockedUntil &&
    this.accountLockedUntil > Date.now()
  ) {
    return true;
  }

  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    this.accountLocked = false;
    this.accountLockedUntil = undefined;
    this.save();
    return false;
  }

  return false;
};

// Method to add device
userSchema.methods.addDevice = function (deviceInfo) {
  const existingDevice = this.devices.find(
    (d) => d.ipAddress === deviceInfo.ipAddress
  );

  if (!existingDevice) {
    this.devices.push(deviceInfo);
  } else {
    existingDevice.lastLogin = Date.now();
  }

  return this.save();
};

// Method to record login
userSchema.methods.recordLogin = function (loginInfo) {
  this.loginHistory.push({
    ...loginInfo,
    timestamp: new Date(),
  });

  // Keep only last 50 logins
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }

  return this.save();
};

export default mongoose.model('User', userSchema);
