# 🔐 SecureAuth AI

> **Intelligent Login Security System for Small Businesses**
> 
> Protect your users from phishing attacks, brute force attacks, and suspicious logins with AI-powered risk detection.

![Screenshot Badge](https://img.shields.io/badge/SecureAuth%20AI-v1.0.0-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React Version](https://img.shields.io/badge/react-18.2.0-61dafb)
![MongoDB](https://img.shields.io/badge/mongodb-4.0+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | Military-grade bcrypt password hashing with JWT tokens |
| 🤖 **Risk Scoring AI** | Real-time risk assessment for every login attempt (0-100 scale) |
| 🛡️ **Brute Force Detection** | Automatic account lockout after suspicious attempts |
| 📱 **Device Tracking** | Monitor all devices with fingerprinting and geo-location |
| 🎣 **Phishing Protection** | Detects fake login pages and suspicious URLs |
| 📧 **OTP Verification** | Email-based one-time passwords for high-risk logins |
| 🚨 **Real-time Alerts** | Instant notifications of security threats |
| 📊 **Admin Dashboard** | Comprehensive analytics and threat monitoring |

## 🎯 Quick Demo

### User Flow
1. **Sign Up** → Secure registration with password strength validation
2. **Login** → Risk assessment in real-time
3. **OTP Verify** → Optional OTP for high-risk logins
4. **Dashboard** → View devices, login history, security settings

### Admin Flow
1. **Dashboard** → Real-time security overview
2. **Alerts** → Monitor all security events
3. **Threats** → Analyze threat patterns and trends
4. **Users** → Manage accounts and security policies

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+ 
- MongoDB
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/SecureAuthAI.git
cd SecureAuthAI

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 and start exploring! 🎉

## 📊 Risk Scoring System

Our AI-powered risk scoring evaluates login attempts based on:

```
┌─────────────────────────────────────┐
│    RISK SCORE CALCULATION ENGINE    │
├─────────────────────────────────────┤
│ New Device              → +25 pts    │
│ New Location            → +20 pts    │
│ Unusual Time            → +10 pts    │
│ Geographic Anomaly      → +15 pts    │
│ Rapid Location Change   → +20 pts    │
│ Failed Attempts         → +30 pts    │
│ Phishing Detected       → +35 pts    │
│ VPN/Proxy              → +10 pts    │
│ TOR Network            → +30 pts    │
│ User Agent Mismatch    → +8 pts     │
└─────────────────────────────────────┘

RISK LEVELS:
🟢 Low (0-24)       → Allow login
🟡 Medium (25-49)   → Monitor & notify
🟠 High (50-74)     → Require OTP
🔴 Critical (75-100)→ Block & verify email
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│  Landing → Login → Dashboard → Admin Panel          │
│  Vite | Tailwind CSS | Recharts | Socket.IO         │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────┐
│              Backend (Express.js)                   │
│  Routes | Controllers | Middleware | Security      │
├─────────────────────────────────────────────────────┤
│  Risk Scoring | Device Detection | Email Service   │
│  JWT Auth | Rate Limiting | Helmet Security        │
└──────────────────┬──────────────────────────────────┘
                   │
          ┌────────┼────────┐
          │        │        │
     ┌────▼──┐ ┌──▼───┐ ┌─▼──────┐
     │MongoDB│ │Socket│ │Nodemailer
     │       │ │  IO  │ │
     └───────┘ └──────┘ └────────┘
```

## 📁 Project Structure

```
SecureAuthAI/
├── 📁 backend/
│   ├── 📁 models/           # MongoDB schemas
│   ├── 📁 controllers/      # Business logic
│   ├── 📁 routes/           # API endpoints
│   ├── 📁 middleware/       # Auth, error handling
│   ├── 📁 utils/            # Helpers (risk scoring, email, device)
│   ├── 📁 config/           # Database config
│   ├── server.js            # Express app
│   ├── package.json
│   └── .env.example
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 pages/        # LandingPage, Login, Dashboard, Admin
│   │   ├── 📁 components/   # ProtectedRoute
│   │   ├── 📁 context/      # Auth state management
│   │   ├── 📁 services/     # API client
│   │   ├── App.jsx          # Main component
│   │   ├── main.jsx         # React entry
│   │   └── index.css        # Tailwind styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
└── 📁 docs/
    ├── SETUP.md             # Installation guide
    ├── API.md               # API documentation
    └── ARCHITECTURE.md      # Design details
```

## 🔑 Key Technologies

### Backend
- **Express.js** - Web framework
- **MongoDB** - Document database
- **JWT** - Stateless authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Socket.IO** - Real-time communication
- **Helmet** - Security headers
- **Rate Limiting** - API protection

### Frontend
- **React 18** - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Charts & graphs
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **React Router** - Navigation

## 📚 Documentation

- **[Setup Guide](./docs/SETUP.md)** - Installation & configuration
- **[API Documentation](./docs/API.md)** - All endpoints & usage
- **[Architecture](./docs/ARCHITECTURE.md)** - System design details

## 🔐 Security Features

### Authentication
- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT token-based auth (7-day expiration)
- ✅ Refresh token rotation (30-day expiration)
- ✅ Auto-logout on token expiration

### Protection
- ✅ Brute force detection (5 failed attempts = lockout)
- ✅ Rate limiting (100 req/15 min)
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ XSS protection via Helmet

### OTP
- ✅ 6-digit secure OTP
- ✅ 10-minute expiration
- ✅ Email-based delivery
- ✅ Single-use enforcement

### Monitoring
- ✅ Security event logging
- ✅ Device fingerprinting
- ✅ Geographic anomaly detection
- ✅ Admin alerts

## 🚦 Getting Started Steps

### 1️⃣ Prerequisites
```bash
node --version  # Should be v16+
npm --version   # Should be v8+
mongod --version # MongoDB should be running
```

### 2️⃣ Environment Setup
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values

# Frontend
cd ../frontend
cp .env.example .env
```

### 3️⃣ Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4️⃣ Run Development Servers
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### 5️⃣ Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin: Login with admin role

## 📧 Email Configuration

### Gmail Setup
```
1. Enable 2-Factor Authentication
2. Create App Password: https://myaccount.google.com/apppasswords
3. In .env:
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
```

### Other Email Services
Supports any email service via Nodemailer configuration in `.env`

## 🧪 Test Accounts

Create these accounts to test the system:

```
Standard User:
  Email: user@test.com
  Password: Test@12345

Admin User:
  Email: admin@test.com
  Password: Admin@12345
  (Update role to 'admin' in MongoDB after creation)
```

## 📊 Admin Dashboard Features

### Overview
- Real-time security statistics
- Risk distribution charts
- Threat trend analysis
- Recent security alerts

### Alerts
- All security events
- Severity filtering
- Time range selection
- Event details

### Threats
- Top threat types
- Most targeted users
- Threat trends (30 days)
- Geographic heatmaps

### Users
- User list with filters
- Account status
- Security history
- Device management

## 🎨 UI/UX Design

### Theme
- **Dark Mode** - Eye-friendly interface
- **Gradient Accents** - Purple & pink gradients
- **Glass Morphism** - Modern frosted glass effects
- **Smooth Animations** - Subtle transitions
- **Responsive Design** - Works on all devices

### Components
- Custom input fields with validation
- Password strength indicator
- Risk level badges
- Device cards
- Alert notifications

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Real-time by [Socket.IO](https://socket.io/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/SecureAuthAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/SecureAuthAI/discussions)
- **Email**: support@secureauth.ai

## 🗺️ Roadmap

- [ ] Two-factor authentication (TOTP)
- [ ] Biometric login support
- [ ] Machine learning threat detection
- [ ] Mobile app (React Native)
- [ ] API rate limiting per user
- [ ] Custom security policies
- [ ] Single sign-on (SSO)
- [ ] Audit trail export
- [ ] Email digest reports
- [ ] Slack/Teams integration

## 📈 Project Stats

```
Total Files: 40+
Lines of Code: 5000+
Backend Routes: 15+
Frontend Pages: 5
Database Collections: 2
Real-time Events: 5+
Security Features: 12+
```

---

<div align="center">

### 🌟 If you find this project useful, please give it a ⭐

**Made with ❤️ for cybersecurity-conscious businesses**

[Website](https://secureauth.ai) • [Twitter](https://twitter.com/secureauth) • [Docs](./docs)

</div>
