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
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// File uploads serving
const uploadsDirectory = path.join(__dirname, '../../../uploads');
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

app.listen(env.PORT, () => {
  console.log(`🚀 ClaimDesk Backend running on port ${env.PORT}`);
});
