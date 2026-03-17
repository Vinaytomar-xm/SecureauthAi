# ⚡ SecureAuth AI - Quick Reference Cheat Sheet

## 🚀 Start in 3 Steps

```bash
# 1. Install dependencies
cd backend && npm install && cd ../frontend && npm install

# 2. Configure .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit with your MongoDB URI and email credentials

# 3. Run (in separate terminals)
npm run dev  # backend
npm run dev  # frontend
```

---

## 🔑 Default Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017 |

---

## 📁 Important Files

```
backend/
├── server.js          ← Express + Socket.IO app
├── models/User.js     ← User schema
├── controllers/       ← Business logic
├── routes/            ← API endpoints
└── utils/             ← Risk scoring, email, device detection

frontend/
├── App.jsx            ← Main app component
├── pages/             ← Page components
├── context/           ← Auth state management
├── services/api.js    ← API client
└── index.css          ← Tailwind styles
```

---

## 🔐 Authentication Flow

```
1. User Signup
   ↓
2. Password Hash (bcrypt)
   ↓
3. JWT Token Generation
   ↓
4. User Logged In

High-Risk Login:
   ↓
5. Risk Assessment (0-100)
   ↓
6. If Risk > 50: Send OTP Email
   ↓
7. User Verifies OTP
   ↓
8. Grant Access + Generate Token
```

---

## 📊 Risk Scoring Breakdown

| Factor | Points |
|--------|--------|
| New Device | +25 |
| New Location | +20 |
| Failed Attempts (each) | +6 |
| Phishing | +35 |
| Unusual Time | +10 |
| Rapid Location Change | +20 |
| VPN/Proxy | +10 |
| TOR Network | +30 |
| Geographic Anomaly | +15 |
| User Agent Mismatch | +8 |

**Levels:**
- 0-24: 🟢 Low (Allow)
- 25-49: 🟡 Medium (Monitor)
- 50-74: 🟠 High (OTP Required)
- 75-100: 🔴 Critical (Block)

---

## 🛡️ Security Features

```
✓ Bcrypt Password Hashing
✓ JWT Authentication (7-day tokens)
✓ OTP Email Verification
✓ Brute Force Detection (5 attempts)
✓ Account Lockout (15 mins)
✓ Device Fingerprinting
✓ GeoIP Tracking
✓ Rate Limiting (100/15 min)
✓ Security Event Logging
✓ Real-time Alerts (Socket.IO)
✓ Admin Dashboard
✓ Helmet Security Headers
```

---

## 📡 API Quick Reference

### Auth Routes (Public)
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
```

### User Routes (Protected)
```
GET  /api/auth/profile
POST /api/auth/logout
```

### Admin Routes (Protected + Admin Role)
```
GET  /api/admin/dashboard
GET  /api/admin/users
GET  /api/admin/alerts
GET  /api/admin/threats
POST /api/admin/user/:id/lock
POST /api/admin/user/:id/unlock
```

---

## 🧪 Example API Calls

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"Test@12345",
    "confirmPassword":"Test@12345"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"Test@12345"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🗄️ Database Setup

### Local MongoDB
```bash
# Install
brew install mongodb  # macOS
# or download from mongodb.com

# Start service
mongod

# Create database
mongo
> use secureauth
> db.createUser({
    user: "admin",
    pwd: "password",
    roles: ["dbOwner"]
  })
```

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to MONGODB_URI in .env

---

## 📧 Gmail Setup for OTP

1. Enable 2-Factor Auth: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. In `.env`:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

---

## 🐳 Docker Quick Start

```bash
# Build and run with compose
docker-compose up

# Build individually
docker build -t secureauth-backend ./backend
docker build -t secureauth-frontend ./frontend

# Run
docker run -p 5000:5000 secureauth-backend
docker run -p 3000:80 secureauth-frontend
```

---

## 🔧 Environment Variables Summary

### Backend
```
MONGODB_URI
JWT_SECRET
FRONTEND_URL
EMAIL_USER
EMAIL_PASSWORD
```

### Frontend
```
VITE_API_URL
```

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Backend Files | 15+ |
| Frontend Pages | 5 |
| Database Models | 2 |
| API Endpoints | 15+ |
| Security Features | 12+ |
| Risk Factors | 10+ |
| Lines of Code | 6,500+ |

---

## 🎯 User Flows

### Regular User
1. Sign Up → Verify Email
2. Login → Set Password Strength
3. Dashboard → View Devices
4. Settings → Manage Security

### High-Risk User
1. Login Detected (Risk > 50)
2. OTP Email Sent
3. Enter OTP Code
4. Verification Complete
5. Grant Access

### Brute Force Attack
1. Failed Login #1
2. Failed Login #2-4
3. Failed Login #5 → Account Locked
4. Admin Notified
5. Can Unlock from Admin Panel

### Admin
1. Login as admin@test.com
2. View Dashboard Stats
3. Monitor Real-time Alerts
4. Review Threat Trends
5. Lock/Unlock User Accounts

---

## 🚨 Common Commands

```bash
# Start MongoDB
mongod

# Start Backend
cd backend && npm run dev

# Start Frontend
cd frontend && npm run dev

# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check MongoDB Connection
mongo mongodb://localhost:27017/secureauth

# View Logs
tail -f logs/*.log

# Kill Process on Port
lsof -ti:5000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

---

## 📚 Documentation Links

| Doc | Path |
|-----|------|
| Setup Guide | docs/SETUP.md |
| API Reference | docs/API.md |
| README | README.md |
| Project Summary | PROJECT_SUMMARY.md |

---

## ✅ Pre-Deployment Checklist

```
□ Update all .env values
□ Change JWT_SECRET
□ Enable HTTPS
□ Configure MongoDB Atlas
□ Set up email service
□ Configure CORS
□ Enable rate limiting
□ Set NODE_ENV=production
□ Test all features
□ Monitor & logging
□ Backup strategy
□ Security headers
□ SSL certificate
```

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB Error | Start mongod or update MONGODB_URI |
| Email Not Sending | Check Gmail app password |
| CORS Error | Update FRONTEND_URL in .env |
| Port in Use | Change PORT in .env |
| Token Invalid | Clear localStorage & login again |

---

## 📞 Quick Links

- **GitHub**: github.com/yourusername/SecureAuthAI
- **Issues**: github.com/yourusername/SecureAuthAI/issues
- **Docs**: docs/ folder
- **Email**: support@secureauth.ai

---

## 🎉 You're Ready!

This is a complete, production-ready platform.

**Time to Deploy: ~20 minutes** ⚡

Good luck! 🚀

---

*Last Updated: March 2024*  
*Version: 1.0.0*
