import { Router, type Request, type Response } from 'express';
import { pusher } from '../common/notifications.js';
import { isDefined } from '../common/url.js';
import * as status from '../common/statusMessages.js';
import { NOW_PLAYING } from '../common/pusherEvents.js';

const sync = Router();

sync.post('/', async (req: Request, res: Response) => {
  const { podId } = req.query;
  const { nowPlaying } = req.body;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!nowPlaying) return status.missingBodyParam(res, 'nowPlaying');

  pusher.trigger(podId as string, NOW_PLAYING, { ...nowPlaying });

  return status.created(res, { message: 'Pushed Now Playing Update', nowPlaying });
});

export default sync;
