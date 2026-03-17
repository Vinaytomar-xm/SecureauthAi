import geoip from 'geoip-lite';
import crypto from 'crypto';

// Generate device fingerprint
export const generateDeviceFingerprint = (userAgent, acceptLanguage) => {
  const combined = `${userAgent}-${acceptLanguage}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
};

// Extract device info from user agent
export const extractDeviceInfo = (userAgent) => {
  const deviceInfo = {
    deviceId: generateDeviceFingerprint(userAgent, 'en-US'),
    deviceName: 'Unknown Device',
    deviceType: 'desktop',
    browser: 'Unknown',
    osType: 'Unknown',
  };

  // Detect browser
  if (userAgent.includes('Chrome')) {
    deviceInfo.browser = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    deviceInfo.browser = 'Safari';
  } else if (userAgent.includes('Firefox')) {
    deviceInfo.browser = 'Firefox';
  } else if (userAgent.includes('Edge')) {
    deviceInfo.browser = 'Edge';
  } else if (userAgent.includes('Opera')) {
    deviceInfo.browser = 'Opera';
  }

  // Detect OS
  if (userAgent.includes('Windows')) {
    deviceInfo.osType = 'Windows';
  } else if (userAgent.includes('Mac')) {
    deviceInfo.osType = 'macOS';
  } else if (userAgent.includes('Linux')) {
    deviceInfo.osType = 'Linux';
  } else if (userAgent.includes('Android')) {
    deviceInfo.osType = 'Android';
    deviceInfo.deviceType = 'mobile';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    deviceInfo.osType = 'iOS';
    deviceInfo.deviceType = userAgent.includes('iPad') ? 'tablet' : 'mobile';
  }

  deviceInfo.deviceName = `${deviceInfo.browser} on ${deviceInfo.osType}`;

  return deviceInfo;
};

// Get location from IP address
export const getLocationFromIP = (ipAddress) => {
  // Skip for localhost
  if (ipAddress === 'localhost' || ipAddress === '127.0.0.1' || ipAddress === '::1') {
    return {
      country: 'Local',
      city: 'Localhost',
      latitude: 0,
      longitude: 0,
    };
  }

  const geo = geoip.lookup(ipAddress);

  if (!geo) {
    return {
      country: 'Unknown',
      city: 'Unknown',
      latitude: 0,
      longitude: 0,
    };
  }

  return {
    country: geo.country,
    city: geo.city || 'Unknown',
    latitude: geo.ll[0],
    longitude: geo.ll[1],
  };
};

// Extract IP address from request
export const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
};

// Check if IP looks like VPN/Proxy
export const isVPNorProxy = (ipAddress) => {
  // This is a simple check. In production, use an IP reputation API
  const vpnIndicators = ['vpn', 'proxy', 'tor'];
  return vpnIndicators.some((indicator) =>
    ipAddress.toLowerCase().includes(indicator)
  );
};

// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default {
  generateDeviceFingerprint,
  extractDeviceInfo,
  getLocationFromIP,
  getClientIP,
  isVPNorProxy,
  generateOTP,
};
