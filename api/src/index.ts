import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './db/database';

// Chargement des variables d'environnement
dotenv.config();

// Import des routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import stationRoutes from './routes/station.routes';
import companyRoutes from './routes/company.routes';
import busRoutes from './routes/bus.routes';
import driverRoutes from './routes/driver.routes';
import routeRoutes from './routes/route.routes';
import scheduleRoutes from './routes/schedule.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import emailTestRoutes from './routes/email.test';

// Import des middlewares
import { errorHandler } from './middlewares/error.middleware';
import { notFound } from './middlewares/notFound.middleware';
import { setupSocketHandlers } from './lib/socket';

const app = express();
const httpServer = createServer(app);

// ─── CORS ───────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
].filter(Boolean);

const isAllowedOrigin = (origin: string) => {
  if (allowedOrigins.includes(origin)) return true;
  // Autoriser tous les sous-domaines *.vercel.app
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;
  return false;
};

// ─── Socket.io (GPS temps réel) ────────────────────────────────────
export const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) callback(null, true);
      else callback(new Error(`CORS bloqué: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketHandlers(io);

// ─── Middlewares globaux ────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué pour l'origine: ${origin}`));
    }
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes API ─────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/stations`, stationRoutes);
app.use(`${API_PREFIX}/companies`, companyRoutes);
app.use(`${API_PREFIX}/buses`, busRoutes);
app.use(`${API_PREFIX}/drivers`, driverRoutes);
app.use(`${API_PREFIX}/routes`, routeRoutes);
app.use(`${API_PREFIX}/schedules`, scheduleRoutes);
app.use(`${API_PREFIX}/bookings`, bookingRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/email-test`, emailTestRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'voyago-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Middlewares d'erreurs ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Démarrage du serveur ───────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

export const startServer = async () => {
  await connectDB();

  return httpServer.listen(PORT, () => {
    console.log(`
  🚍 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Voyago API — Démarré avec succès !
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌍 URL     : http://localhost:${PORT}
  💚 Health  : http://localhost:${PORT}/health
  📡 API     : http://localhost:${PORT}/api/v1
  🔧 Env     : ${process.env.NODE_ENV || 'development'}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  });
};

if (process.env.NODE_ENV !== 'test') {
  void startServer();
}

export default app;
