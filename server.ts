import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './server/db.ts';
import { authRouter } from './server/routes/auth.ts';
import { businessRouter } from './server/routes/business.ts';
import { servicesRouter } from './server/routes/services.ts';
import { bookingsRouter } from './server/routes/bookings.ts';
import { tenantsRouter } from './server/routes/tenants.ts';
import { ledgerRouter } from './server/routes/ledger.ts';
import { modulesRouter } from './server/routes/modules.ts';
import { branchesRouter } from './server/routes/branches.ts';
import { aiRouter } from './server/routes/ai.ts';
import { auditRouter } from './server/routes/audit.ts';
import { paymentsRouter } from './server/routes/payments.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(cookieParser());

  // Initialize PostgreSQL schema and initial dynamic data
  await initDatabase();

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/business', businessRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/tenants', tenantsRouter);
  app.use('/api/ledger', ledgerRouter);
  app.use('/api/branches', branchesRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/audit-logs', auditRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api', modulesRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      database: 'PostgreSQL (Active)',
      timestamp: new Date().toISOString(),
    });
  });

  // Frontend integration
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (http://0.0.0.0:${PORT})`);
  });

  const cleanup = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
