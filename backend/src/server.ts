import 'dotenv/config';
import express, { Application } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initSocket } from './socket';
import authRoutes from './routes/auth.routes';
import notificationRoutes from './routes/notification.routes';

// ─────────────────────────────────────────
// APP SETUP
// ─────────────────────────────────────────

const app: Application = express();
const httpServer = createServer(app);

// ─────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─────────────────────────────────────────
// GENERAL MIDDLEWARE
// ─────────────────────────────────────────

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────

app.use('/api', apiLimiter);

// ─────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// ─────────────────────────────────────────
// 404 + ERROR HANDLERS
// Must be registered after all routes
// ─────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────

initSocket(httpServer);

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────

const startServer = async (): Promise<void> => {
  httpServer.listen(env.PORT, () => {
    console.log(`[server] running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`[server] health check → http://localhost:${env.PORT}/health`);
  });
};

startServer().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});

export { app, httpServer };