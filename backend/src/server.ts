import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import oilRoutes from './routes/oil';
import ewasteRoutes from './routes/ewaste';
import pickupsRoutes from './routes/pickups';
import collectionsRoutes from './routes/collections';
import complianceRoutes from './routes/compliance';
import leaderboardRoutes from './routes/leaderboard';
import notificationsRoutes from './routes/notifications';
import rainwaterRoutes from './routes/rainwater';
import reportsRoutes from './routes/reports';
import sellerRoutes from './routes/seller';
import adminRoutes from './routes/admin';

dotenv.config({ path: '../.env.local' });

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS — only allow the frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Rate limiting — stricter on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per window
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 200,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard',     apiLimiter, dashboardRoutes);
app.use('/api/oil',           apiLimiter, oilRoutes);
app.use('/api/ewaste',        apiLimiter, ewasteRoutes);
app.use('/api/pickups',       apiLimiter, pickupsRoutes);
app.use('/api/collections',   apiLimiter, collectionsRoutes);
app.use('/api/compliance',    apiLimiter, complianceRoutes);
app.use('/api/leaderboard',   apiLimiter, leaderboardRoutes);
app.use('/api/notifications', apiLimiter, notificationsRoutes);
app.use('/api/rainwater',     apiLimiter, rainwaterRoutes);
app.use('/api/reports',       apiLimiter, reportsRoutes);
app.use('/api/seller',        apiLimiter, sellerRoutes);
app.use('/api/admin',         apiLimiter, adminRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ReLoop Backend' }));

app.listen(PORT, () => {
  console.log(`ReLoop Backend running on http://localhost:${PORT}`);
});

export default app;
