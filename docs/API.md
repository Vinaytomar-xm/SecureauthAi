# SecureAuth AI - API Documentation

Complete REST API reference for SecureAuth AI system.

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Endpoints](#user-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Socket.IO Events](#socketio-events)

---

## 🔑 Authentication Endpoints

### Register User

Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Login User

Authenticate with email and password. May return OTP requirement.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (Normal Login - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "riskLevel": "low",
  "riskScore": 15,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Response with OTP Required (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email. High-risk login detected.",
  "requireOTP": true,
  "riskLevel": "high",
  "riskScore": 68
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "attemptsRemaining": 3
}
```

**Error Response (423 - Account Locked):**
```json
{
  "success": false,
  "message": "Account temporarily locked due to multiple failed login attempts. Please try again later."
}
```

### Verify OTP

Verify OTP sent to user's email for high-risk logins.

```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

---

## 👤 User Endpoints

All user endpoints require authentication. Include JWT token in Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

### Get User Profile

Retrieve user profile with devices and login history.

```http
GET /api/auth/profile
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "devices": [
      {
        "deviceId": "abc123def456",
        "deviceName": "Chrome on Windows",
        "deviceType": "desktop",
        "browser": "Chrome",
        "osType": "Windows",
        "ipAddress": "192.168.1.100",
        "location": {
          "country": "US",
          "city": "San Francisco",
          "latitude": 37.7749,
          "longitude": -122.4194
        },
        "lastLogin": "2024-03-16T10:30:00Z",
        "isVerified": true,
        "addedDate": "2024-03-01T08:00:00Z"
      }
    ],
    "loginHistory": [
      {
        "timestamp": "2024-03-16T10:30:00Z",
        "ipAddress": "192.168.1.100",
        "deviceId": "abc123def456",
        "deviceName": "Chrome on Windows",
        "location": {
          "country": "US",
          "city": "San Francisco"
        },
        "riskScore": 15,
        "riskLevel": "low",
        "success": true
      }
    ]
  }
}
```

### Logout User

Logout user (clears token on client side).

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🛡️ Admin Endpoints

All admin endpoints require:
1. Valid JWT token (Authorization header)
2. Admin role

```
Authorization: Bearer {admin_token}
```

### Get Dashboard Statistics

Get real-time security dashboard statistics.

```http
GET /api/admin/dashboard
Authorization: Bearer {admin_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "activeUsers": 145,
    "lockedAccounts": 2,
    "suspiciousLogins": 12,
    "blockedAttempts": 8,
    "riskDistribution": [
      {
        "_id": "low",
        "count": 450
      },
      {
        "_id": "medium",
        "count": 120
      },
      {
        "_id": "high",
        "count": 45
      },
      {
        "_id": "critical",
        "count": 8
      }
    ]
  },
  "recentAlerts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "eventType": "login_success",
      "severity": "low",
      "riskScore": 25,
      "description": "Login successful - Risk Level: medium",
      "ipAddress": "192.168.1.100",
      "location": {
        "country": "US",
        "city": "San Francisco"
      },
      "createdAt": "2024-03-16T10:30:00Z"
    }
  ]
}
```

### Get All Users

Get paginated list of all users with security info.

```http
GET /api/admin/users?page=1&limit=10
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page (max: 50)

**Success Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "isEmailVerified": true,
      "failedLoginAttempts": 0,
      "accountLocked": false,
      "isActive": true,
      "createdAt": "2024-03-01T08:00:00Z",
      "updatedAt": "2024-03-16T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

### Get User Security Details

Get detailed security information for a specific user.

```http
GET /api/admin/user/{userId}/security
Authorization: Bearer {admin_token}
```

**URL Parameters:**
- `userId` (string) - User MongoDB ID

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "devices": [...],
    "loginHistory": [...],
    "accountLocked": false,
    "failedLoginAttempts": 0
  },
  "securityStats": {
    "loginAttempts": 45,
    "suspiciousActivities": 2,
    "recentSecurityLogs": [...]
  }
}
```

### Get Security Alerts

Get all security alerts with optional filtering.

```http
GET /api/admin/alerts?severity=high&days=7
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `severity` (string) - Filter by severity: `low`, `medium`, `high`, `critical`, or `all` (default)
- `days` (integer, default: 7) - Number of days to look back

**Success Response (200):**
```json
{
  "success": true,
  "alerts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "eventType": "login_attempt",
      "severity": "high",
      "riskScore": 72,
      "description": "Unusual location detected",
      "ipAddress": "203.0.113.50",
      "location": {
        "country": "CN",
        "city": "Beijing"
      },
      "createdAt": "2024-03-16T09:15:00Z"
    }
  ],
  "alertsByType": [
    {
      "_id": "login_attempt",
      "count": 28
    },
    {
      "_id": "brute_force_detected",
      "count": 5
    }
  ],
  "totalAlerts": 33
}
```

### Get Threat Analysis

Analyze threats over time with trends and targets.

```http
GET /api/admin/threats?days=30
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `days` (integer, default: 30) - Analysis period in days

**Success Response (200):**
```json
{
  "success": true,
  "threatsByDay": [
    {
      "_id": "2024-03-01",
      "count": 5
    },
    {
      "_id": "2024-03-02",
      "count": 8
    }
  ],
  "topThreats": [
    {
      "_id": "login_attempt",
      "count": 120
    },
    {
      "_id": "brute_force_detected",
      "count": 45
    }
  ],
  "topTargetedUsers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "count": 28,
      "user": [
        {
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      ]
    }
  ]
}
```

### Lock User Account

Temporarily lock a user account.

```http
POST /api/admin/user/{userId}/lock
Authorization: Bearer {admin_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User account locked successfully"
}
```

### Unlock User Account

Unlock a previously locked user account.

```http
POST /api/admin/user/{userId}/unlock
Authorization: Bearer {admin_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User account unlocked successfully"
}
```

---

## ❌ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login successful |
| 201 | Created | Account created |
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Invalid token |
| 403 | Forbidden | Admin access required |
| 404 | Not Found | User not found |
| 423 | Locked | Account temporarily locked |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

### Error Examples

**Validation Error (400):**
```json
{
  "success": false,
  "message": "email must be a valid email address"
}
```

**Authorization Error (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Rate Limit Error (429):**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

---

## 🚦 Rate Limiting

All API endpoints are rate limited:

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: Returned with each response

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1647432000
```

When limit exceeded:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 300
```

---

## 🔌 Socket.IO Events

Real-time events for admin notifications.

### Connection

```javascript
// Client
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Emit Events (Client → Server)

**User Login Event:**
```javascript
socket.emit('user_login', {
  userId: '507f1f77bcf86cd799439012',
  email: 'john@example.com',
  location: 'San Francisco, US'
});
```

**Security Alert Event:**
```javascript
socket.emit('security_alert', {
  alertType: 'brute_force',
  userId: '507f1f77bcf86cd799439012',
  severity: 'high',
  message: 'Multiple failed login attempts detected'
});
```

### Listen Events (Server → Client)

**User Activity Update:**
```javascript
socket.on('user_activity', (data) => {
  console.log('User activity:', data);
  // {
  //   type: 'login',
  //   userId: '507f1f77bcf86cd799439012',
  //   email: 'john@example.com',
  //   location: 'San Francisco, US',
  //   timestamp: '2024-03-16T10:30:00Z'
  // }
});
```

**Alert Notification:**
```javascript
socket.on('alert_notification', (data) => {
  console.log('Security alert:', data);
  // {
  //   type: 'brute_force',
  //   userId: '507f1f77bcf86cd799439012',
  //   severity: 'high',
  //   message: 'Multiple failed login attempts detected',
  //   timestamp: '2024-03-16T10:30:00Z'
  // }
});
```

---

## 📝 Example Requests

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Profile (with token):**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Register
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!'
  })
});

const data = await registerResponse.json();
console.log(data);
```

### Using Postman

1. Import the collection from `postman_collection.json`
2. Set environment variables:
   - `baseUrl`: http://localhost:5000
   - `token`: Your JWT token
3. Run requests

---

## 📚 Additional Resources

- [Authentication Best Practices](https://owasp.org/www-community/authentication/authentication_cheat_sheet.html)
- [JWT Guide](https://jwt.io/introduction)
- [REST API Design](https://restfulapi.net/)

---

**Last Updated**: March 2024  
**API Version**: 1.0.0
