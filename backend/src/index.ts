import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import claimsRoutes from './routes/claims';
import claimStatusRoutes from './routes/claimStatus';
import notesRoutes from './routes/notes';
import eventsRoutes from './routes/events';
import policiesRoutes from './routes/policies';
import fxRoutes from './routes/fx';
import healthRoutes from './routes/health';
import auditRoutes from './routes/audit';
import { requireAuth } from './middleware/auth';

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map(o => o.trim()),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

import fs from 'fs';
import { initDB } from './config/database';

// File uploads serving
const uploadsDirectory = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}
app.use('/uploads', express.static(uploadsDirectory));

// Routes
app.use('/auth', authRoutes);
app.use('/claims', claimsRoutes);
app.use('/claims/:id/status', claimStatusRoutes);
app.use('/claims/:id/notes', notesRoutes);
app.use('/claims/:id/events', eventsRoutes);
app.use('/policies', policiesRoutes);
app.use('/fx', fxRoutes);
app.use('/health', healthRoutes);
app.use('/audit', auditRoutes);

// Error Handling
app.use(errorHandler);

const portNumber = parseInt(process.env.PORT || env.PORT || '10000', 10);

app.listen(portNumber, '0.0.0.0', () => {
  console.log(`🚀 ClaimDesk Backend running on port ${portNumber}`);
  initDB()
    .then(() => console.log('✅ Database initialized successfully'))
    .catch((err) => console.error('⚠️ Database connection deferred/failed:', err.message));
});


