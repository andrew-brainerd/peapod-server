import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as log from './common/logger.js';
import { disconnectFromMongoDB } from './common/db.js';
import router from './api/index.js';

const requiredEnvVars = ['MONGODB_URI', 'DB_NAME'] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    log.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const port = process.env.PORT || 3001;
const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.PEAPOD_UI_URL || '*',
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE']
  })
);
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  })
);

app.use('/api', router);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  log.error('Unhandled error', err as unknown as Record<string, unknown>);
  res.status(500).send({ message: 'Internal server error' });
});

const server = app.listen(port, () => log.info(`Listening on port ${port}`));

const shutdown = async (signal: string) => {
  log.info(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await disconnectFromMongoDB();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
