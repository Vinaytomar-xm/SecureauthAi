// Risk scoring calculation based on various factors
export const calculateRiskScore = (factors) => {
  let riskScore = 0;

  // Failed login attempts (max 30 points)
  if (factors.failedAttempts > 0) {
    riskScore += Math.min(factors.failedAttempts * 6, 30);
  }

  // New device (25 points)
  if (factors.isNewDevice) {
    riskScore += 25;
  }

  // New location (20 points)
  if (factors.isNewLocation) {
    riskScore += 20;
  }

  // Unusual login time (10 points)
  if (factors.isUnusualTime) {
    riskScore += 10;
  }

  // Geographic distance anomaly (15 points)
  if (factors.geographicAnomalySuspicious) {
    riskScore += 15;
  }

  // Rapid location change (20 points)
  if (factors.rapidLocationChange) {
    riskScore += 20;
  }

  // Phishing indicators (35 points)
  if (factors.phishingDetected) {
    riskScore += 35;
  }

  // VPN/Proxy usage (10 points)
  if (factors.vpnDetected) {
    riskScore += 10;
  }

  // Tor network (30 points)
  if (factors.torDetected) {
    riskScore += 30;
  }

  // User agent mismatch (8 points)
  if (factors.userAgentMismatch) {
    riskScore += 8;
  }

  return Math.min(riskScore, 100);
};

export const getRiskLevel = (score) => {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
};

export const getRiskAction = (riskLevel) => {
  switch (riskLevel) {
    case 'critical':
      return {
        action: 'block',
        requireOTP: true,
        requireEmailVerification: true,
        notifyUser: true,
        alertAdmin: true,
      };
    case 'high':
      return {
        action: 'challenge',
        requireOTP: true,
        requireEmailVerification: false,
        notifyUser: true,
        alertAdmin: true,
      };
    case 'medium':
      return {
        action: 'monitor',
        requireOTP: false,
        requireEmailVerification: false,
        notifyUser: true,
        alertAdmin: false,
      };
    case 'low':
      return {
        action: 'allow',
        requireOTP: false,
        requireEmailVerification: false,
        notifyUser: false,
        alertAdmin: false,
      };
    default:
      return {
        action: 'allow',
        requireOTP: false,
        requireEmailVerification: false,
        notifyUser: false,
        alertAdmin: false,
      };
  }
};

// Detect phishing indicators
export const detectPhishing = (loginUrl, referrer) => {
  const phishingIndicators = {
    domainMismatch: false,
    suspiciousUrl: false,
    fakeProtocol: false,
    suspiciousCharacters: false,
  };

  // Check for domain mismatch
  if (!loginUrl.includes('secureauth.com')) {
    phishingIndicators.domainMismatch = true;
  }

  // Check for suspicious URL patterns
  const suspiciousPatterns = [
    /secure-auth/,
    /secureauth-verify/,
    /login-confirm/,
    /verify-account/,
  ];

  suspiciousPatterns.forEach((pattern) => {
    if (pattern.test(loginUrl)) {
      phishingIndicators.suspiciousUrl = true;
    }
  });

  // Check if using HTTP instead of HTTPS
  if (loginUrl.startsWith('http://')) {
    phishingIndicators.fakeProtocol = true;
  }

  // Check for suspicious characters
  if (
    loginUrl.includes('http://127.0.0.1') ||
    loginUrl.includes('192.168') ||
    loginUrl.includes('localhost')
  ) {
    phishingIndicators.suspiciousCharacters = true;
  }

  return Object.values(phishingIndicators).some((v) => v);
};

// Check for rapid location changes (impossible travel)
export const checkRapidLocationChange = (lastLocation, currentLocation) => {
  if (!lastLocation) return false;

  // Haversine formula to calculate distance
  const R = 6371; // Earth's radius in km
  const dLat = ((currentLocation.latitude - lastLocation.latitude) * Math.PI) / 180;
  const dLon = ((currentLocation.longitude - lastLocation.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lastLocation.latitude * Math.PI) / 180) *
      Math.cos((currentLocation.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // If distance > 900km in last 15 minutes, it's suspicious
  // Average flight speed is ~900 km/h, so unlikely for human to travel
  return distance > 900;
};

// Detect unusual login time
export const isUnusualLoginTime = (user) => {
  if (user.loginHistory.length === 0) return false;

  const currentHour = new Date().getHours();
  const userLoginTimes = user.loginHistory
    .slice(-30)
    .map((login) => new Date(login.timestamp).getHours());

  const averageHour =
    userLoginTimes.reduce((a, b) => a + b, 0) / userLoginTimes.length;

  // If current login is more than 8 hours away from average, it's unusual
  const diff = Math.abs(currentHour - averageHour);
  return diff > 8 && diff < 16; // 8 hours difference but not exactly 12 (timezone change)
};

// Check if device is new
export const isNewDevice = (user, deviceId) => {
  return !user.devices.some((d) => d.deviceId === deviceId);
};

// Check if location is new
export const isNewLocation = (user, currentLocation) => {
  if (user.loginHistory.length === 0) return true;

  const lastLocation = user.loginHistory[user.loginHistory.length - 1].location;
  return (
    lastLocation.country !== currentLocation.country ||
    lastLocation.city !== currentLocation.city
  );
};
