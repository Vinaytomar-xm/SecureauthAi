import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

// ── CORS config (single source of truth) ──────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,          // your Vercel URL from env
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);                   // removes undefined if env not set

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('[CORS] Blocked origin:', origin);
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// ── Socket.IO ─────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,          // reuse same list
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Middleware (order matters) ────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ← handle ALL preflight requests
app.use(express.json({ limit: '10mb' }));           // ← moved BEFORE rate limiter
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Rate limiting ─────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,   // return RateLimit-* headers
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// ── Socket.IO events ──────────────────────────────────
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('user_login', (data) => {
    connectedUsers.set(socket.id, data.userId);
    io.emit('user_activity', {
      type: 'login',
      userId: data.userId,
      email: data.email,
      location: data.location,
      timestamp: new Date(),
    });
  });

  socket.on('security_alert', (data) => {
    io.emit('alert_notification', {
      type: data.alertType,
      userId: data.userId,
      severity: data.severity,
      message: data.message,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedUsers.delete(socket.id);
  });
});

// ── Error handling (must be last) ────────────────────
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start server ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Allowed origins:`, allowedOrigins);  // ← confirm on startup
});

export { io };