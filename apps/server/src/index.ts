import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables first
dotenv.config();

// Initialize database (will auto-create tables for SQLite)
import './db/index-sqlite';

import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import githubRoutes from './routes/github';
import executeRoutes from './routes/execute';
import sessionsRoutes from './routes/sessions';
import userRoutes from './routes/user';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware (adds user to request if authenticated)
app.use(authMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/user', userRoutes);
app.use('/api', executeRoutes);
app.use('/api/sessions', sessionsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Handle client-side routing - send index.html for non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`AI Worker URL: ${process.env.AI_WORKER_URL}`);
});
