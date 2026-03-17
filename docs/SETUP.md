# SecureAuth AI - Intelligent Login Security System

A production-ready, AI-powered cybersecurity platform that protects small businesses from phishing attacks, brute force attacks, stolen passwords, and suspicious device logins.

## 🎯 Features

### 🔐 Core Security Features
- **Secure Authentication**: Military-grade bcrypt password hashing with JWT tokens
- **Risk Scoring Engine**: AI-powered risk assessment (0-100 scale) for every login
- **Brute Force Detection**: Automatic account lockout after suspicious attempts
- **Device Tracking**: Real-time device fingerprinting and location tracking
- **Phishing Protection**: Advanced detection of phishing URLs and fake login pages
- **OTP Verification**: Email-based one-time password for high-risk logins
- **Real-time Alerts**: Socket.IO powered instant security notifications
- **Admin Dashboard**: Comprehensive threat monitoring and analytics

### 📊 Advanced Features
- Risk calculation based on:
  - New devices
  - New locations
  - Unusual login times
  - Geographic anomalies
  - Failed login attempts
  - VPN/Proxy detection
  
- Device monitoring:
  - Device fingerprinting
  - Browser detection
  - OS identification
  - IP address tracking
  - Location geolocation

- Analytics:
  - Real-time threat dashboard
  - Security trends analysis
  - User activity tracking
  - Threat heatmaps
  - Detailed security logs

## 🏗️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Socket.IO** - Real-time communication
- **Helmet** - Security headers
- **Express Rate Limiting** - API protection

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Socket.IO Client** - Real-time updates

## 📁 Project Structure

```
SecureAuthAI/
├── backend/
│   ├── models/
│   │   ├── User.js                 # User schema with security fields
│   │   └── SecurityLog.js          # Security event logging
│   ├── controllers/
│   │   ├── authController.js       # Authentication logic
│   │   └── adminController.js      # Admin dashboard logic
│   ├── routes/
│   │   ├── authRoutes.js           # Public auth routes
│   │   └── adminRoutes.js          # Protected admin routes
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification
│   │   └── errorHandler.js         # Error handling
│   ├── utils/
│   │   ├── riskScoring.js          # Risk calculation engine
│   │   ├── emailService.js         # Email templates & sending
│   │   └── deviceDetection.js      # Device fingerprinting
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── server.js                   # Express app & Socket.IO
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Marketing homepage
│   │   │   ├── SignupPage.jsx      # Registration
│   │   │   ├── LoginPage.jsx       # Login with OTP
│   │   │   ├── Dashboard.jsx       # User dashboard
│   │   │   └── AdminDashboard.jsx  # Admin panel
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── services/
│   │   │   └── api.js              # API client
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
└── docs/
    ├── SETUP.md                    # This file
    ├── API.md                      # API documentation
    └── ARCHITECTURE.md             # System design
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.0+
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/SecureAuthAI.git
cd SecureAuthAI
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MongoDB URI
# JWT_SECRET (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# Email service credentials (Gmail app password)
# Frontend URL
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# .env should contain:
# VITE_API_URL=http://localhost:5000/api
```

### Step 4: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod

# Create database
mongo
> use secureauth
> db.createUser({user: "admin", pwd: "your_password", roles: ["dbOwner"]})
```

**Option B: MongoDB Atlas (Cloud)**
```
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in .env
```

### Step 5: Email Configuration

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Create App Password: https://myaccount.google.com/apppasswords
3. In .env:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 6: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App opens on http://localhost:5173
```

## 🔑 Environment Variables

### Backend (.env)
```
# Database
MONGODB_URI=mongodb://localhost:27017/secureauth
MONGODB_USER=admin
MONGODB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=refresh_secret_here
JWT_REFRESH_EXPIRE=30d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=app_password_here
EMAIL_FROM=noreply@secureauth.com

# Security
OTP_EXPIRE=10
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=15

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Endpoints

### Authentication Routes (Public)
```
POST /api/auth/register
  Body: {firstName, lastName, email, password, confirmPassword}
  
POST /api/auth/login
  Body: {email, password}
  Response: {token, user, requireOTP?, riskLevel?, riskScore?}
  
POST /api/auth/verify-otp
  Body: {email, otp}
  Response: {token, user}
```

### User Routes (Protected)
```
GET /api/auth/profile
  Headers: Authorization: Bearer {token}
  
POST /api/auth/logout
  Headers: Authorization: Bearer {token}
```

### Admin Routes (Protected, Admin Role)
```
GET /api/admin/dashboard
  Returns: {stats, recentAlerts}
  
GET /api/admin/users?page=1&limit=10
  Returns: {users, pagination}
  
GET /api/admin/user/:userId/security
  Returns: {user, securityStats}
  
GET /api/admin/alerts?severity=all&days=7
  Returns: {alerts, alertsByType}
  
GET /api/admin/threats?days=30
  Returns: {threatsByDay, topThreats, topTargetedUsers}
  
POST /api/admin/user/:userId/lock
POST /api/admin/user/:userId/unlock
```

## 🔐 Security Implementation

### Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plaintext
- Minimum 8 characters required
- Password strength validation on frontend

### Token Security
- JWT tokens with 7-day expiration
- Refresh tokens with 30-day expiration
- Tokens stored in localStorage
- Auto logout on token expiration

### OTP Security
- 6-digit random OTP
- 10-minute expiration
- Sent via verified email
- Cannot be reused

### Brute Force Protection
- Max 5 failed login attempts
- 15-minute account lockout
- Failed attempts logged
- Admin notifications

### Data Protection
- Helmet.js for security headers
- CORS enabled for frontend
- Rate limiting (100 requests/15 min)
- Input validation on all routes
- MongoDB injection prevention via Mongoose

### Device Tracking
- Device fingerprinting (SHA-256 hash)
- Browser detection
- OS identification
- IP address logging
- GeoIP location tracking

## 📊 Risk Scoring Algorithm

### Risk Factors
```
New Device: +25 points
New Location: +20 points
Unusual Login Time: +10 points
Geographic Anomaly: +15 points
Rapid Location Change: +20 points
Failed Attempts (6x per attempt): +30 max
Phishing Detection: +35 points
VPN/Proxy: +10 points
TOR Network: +30 points
User Agent Mismatch: +8 points
```

### Risk Levels
- **Low (0-24)**: Normal login, allow
- **Medium (25-49)**: Monitor, notify user
- **High (50-74)**: Require OTP verification
- **Critical (75-100)**: Block and require email verification

## 🧪 Testing

### Test Account
```
Email: test@example.com
Password: Test@123456

Admin Account (create via register, then update role to 'admin' in DB)
Email: admin@example.com
Password: Admin@123456
```

### Test Scenarios
1. **Normal Login**: Standard email/password from same device
2. **High Risk Login**: Different location or device
3. **Brute Force**: 5+ failed attempts
4. **OTP Verification**: High-risk login requiring OTP
5. **Account Lockout**: Attempt login on locked account

## 📈 Monitoring

### Admin Dashboard
- Real-time user activity
- Security alert notifications
- Threat trend analysis
- User management
- Device tracking
- Login history

### Security Logs
All events logged to MongoDB:
- Login attempts (success/failure)
- Suspicious activities
- Account lockouts
- OTP verification
- Device additions
- Password changes

## 🚢 Deployment

### Heroku Deployment

**Backend:**
```bash
cd backend
heroku login
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
# ... set all other env vars
```

**Frontend:**
```bash
cd frontend
npm run build
# Deploy build folder to Netlify or Vercel
```

### Docker Deployment

```bash
# Build images
docker build -t secureauth-backend ./backend
docker build -t secureauth-frontend ./frontend

# Run containers
docker run -p 5000:5000 secureauth-backend
docker run -p 5173:5173 secureauth-frontend
```

## 📝 Key Files to Customize

1. **backend/config/database.js** - Database connection
2. **backend/utils/emailService.js** - Email templates
3. **frontend/src/context/AuthContext.jsx** - Auth state management
4. **frontend/src/pages/LandingPage.jsx** - Marketing copy

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB is running
mongod --version

# For MongoDB Atlas, verify:
# - IP whitelist includes your IP
# - Connection string is correct
# - Username/password are correct
```

### Email Not Sending
```bash
# Verify Gmail app password
# Enable "Less secure app access" if not using app password
# Check SMTP settings are correct
# Test with: node -e "const nodemailer = require('nodemailer'); console.log('OK')"
```

### CORS Errors
```bash
# Backend: Verify FRONTEND_URL in .env matches frontend URL
# Frontend: Verify VITE_API_URL in .env points to correct backend
```

### Port Already in Use
```bash
# Change PORT in backend .env
# Change vite port in frontend vite.config.js
```

## 📞 Support & Documentation

- **API Documentation**: See `API.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 📄 License

MIT License - See LICENSE.txt

## 🙏 Credits

Built with ❤️ for cybersecurity-conscious businesses

---

**Happy Securing! 🔐**
