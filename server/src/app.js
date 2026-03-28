import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import movieRoutes from './routes/movies.js';
import trackRoutes from './routes/tracks.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './config/logger.js';

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));

// ── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ───────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.debug(`→ ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/movies', movieRoutes);
app.use('/api/track', trackRoutes);

// ── Error Handler (must be last) ──────────────────────────────────────────
app.use(errorHandler);

export default app;
