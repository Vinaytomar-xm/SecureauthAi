import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        'account_created',
        'login_attempt',
        'login_success',
        'login_failed',
        'brute_force_detected',
        'phishing_attempt',
        'unusual_location',
        'new_device',
        'account_locked',
        'password_changed',
        'otp_sent',
        'otp_verified',
        'device_added',
        'suspicious_activity',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    description: String,
    ipAddress: String,
    deviceInfo: {
      deviceId: String,
      deviceName: String,
      browser: String,
      osType: String,
    },
    location: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
    metadata: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['detected', 'verified', 'resolved'],
      default: 'detected',
    },
    resolvedBy: mongoose.Schema.Types.ObjectId,
    resolvedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
securityLogSchema.index({ userId: 1, createdAt: -1 });
securityLogSchema.index({ eventType: 1 });
securityLogSchema.index({ severity: 1 });
securityLogSchema.index({ riskScore: -1 });

export default mongoose.model('SecurityLog', securityLogSchema);
