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

// ── CORS — handles localhost + Vercel both ────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://secureauth-frontend-xi.vercel.app',
]
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/$/, ''));

console.log('[CORS] Allowed origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman, curl, mobile apps (no origin header)
    if (!origin) return callback(null, true);
    const clean = origin.trim().replace(/\/$/, '');
    if (allowedOrigins.includes(clean)) {
      callback(null, true);
    } else {
      console.error('[CORS] Blocked origin:', origin);
      callback(new Error('CORS: Origin not allowed → ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Middleware — ORDER MATTERS ────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle ALL preflight OPTIONS requests

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    allowedOrigins,
  });
});

// ── Socket.IO events ──────────────────────────────────────────────────────────
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('[Socket] Client connected:', socket.id);

  socket.on('join_admin', () => {
    socket.join('admin-room');
  });

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
    io.to('admin-room').emit('alert_notification', {
      type: data.alertType,
      userId: data.userId,
      severity: data.severity,
      message: data.message,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected:', socket.id);
    connectedUsers.delete(socket.id);
  });
});

// ── Error handling — MUST be last ────────────────────────────────────────────
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
});

export { io };
