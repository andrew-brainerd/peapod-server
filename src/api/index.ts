import { Router } from 'express';
import { createRequire } from 'module';
import { requireAuth } from '../middleware/authentication.js';
import pods from '../pods/pods.router.js';
import spotify from '../spotify/spotify.router.js';
import sync from '../sync/sync.router.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

const router = Router();

router.get('/', (_req, res) => {
  res.send({
    message: `Welcome to the Peapod API v${version}!`
  });
});

router.get('/health', (_req, res) => {
  res.send({ status: 'ok', version });
});

router.use('/pods', requireAuth, pods);
router.use('/spotify', spotify);
router.use('/sync', requireAuth, sync);

export default router;
