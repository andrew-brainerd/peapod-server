import { Router, type Request, type Response } from 'express';
import * as podsData from './pods.repository.js';
import * as status from '../common/statusMessages.js';
import { pusher } from '../common/notifications.js';
import { isDefined } from '../common/url.js';
import { MEMBER_ADDED, LAUNCH_GAME } from '../common/pusherEvents.js';

const pods = Router();

pods.post('/', async (req: Request, res: Response) => {
  const {
    body: { createdBy }
  } = req;

  if (!createdBy) return status.missingBodyParam(res, 'createdBy');

  const newPod = await podsData.createPod(createdBy);
  if (!newPod) return status.serverError(res, 'Failed', 'Failed to create pod');

  return status.created(res, { ...newPod });
});

pods.get('/', async (req: Request, res: Response) => {
  const { pageNum, pageSize, userId } = req.query;
  const page = parseInt(pageNum as string) || 1;
  const size = parseInt(pageSize as string) || 50;

  const { items, totalItems, totalPages } = await podsData.getPods(page, size, userId as string | undefined);

  return status.success(res, {
    items,
    pageNum: page,
    pageSize: size,
    totalItems,
    totalPages
  });
});

pods.get('/:podId', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');

  const pod = await podsData.getPod(podId);
  return status.success(res, { ...pod });
});

pods.delete('/:podId', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');

  try {
    await podsData.deletePod(podId);
    return status.success(res, { message: `Deleted pod [${podId}]` });
  } catch {
    return status.doesNotExist(res, 'Pod', podId);
  }
});

pods.post('/:podId/invite', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;
  const { messageType, to } = req.body;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!to) return status.missingBodyParam(res, 'to');

  const invite = await podsData.sendInviteCode(podId, messageType, to);
  if (!invite) return status.serverError(res, 'Failed', `Failed sending invite to [${to}]`);

  return status.success(res, { ...invite });
});

pods.patch('/:podId/members', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;
  const { user } = req.body;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  const { alreadyExists } = await podsData.addMember(podId, user);
  if (alreadyExists) return status.alreadyExists(res, 'User', 'name', user.name, `pod [${podId}]`);

  pusher.trigger(podId, MEMBER_ADDED, {});

  return status.success(res, {
    message: `Added user [${user.name}] to pod [${podId}]`
  });
});

pods.delete('/:podId/members', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;
  const { user } = req.body;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  const { notAMember } = await podsData.removeMember(podId, user);
  if (notAMember) return status.doesNotExist(res, 'Member', user.name, `pod [${podId}]`);

  return status.success(res, {
    message: `Removed member [${user.name}] from pod [${podId}]`
  });
});

pods.patch('/:podId/queue', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;
  const { track } = req.body;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  const { alreadyExists } = await podsData.addTrackToPlayQueue(podId, track);
  if (alreadyExists) return status.alreadyExists(res, 'Track', 'name', track.name);

  return status.success(res, {
    message: `Added track [${track.name}] to pod [${podId}] play queue`
  });
});

pods.delete('/:podId/queue', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;
  const { track } = req.body;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  const { notAMember } = await podsData.removeTrackFromPlayQueue(podId, track);
  if (notAMember) return status.doesNotExist(res, 'Track', track.name, `pod [${podId}]`);

  return status.success(res, {
    message: `Removed track [${track.name}] from pod [${podId}]`
  });
});

pods.patch('/:podId/history', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;
  const { track } = req.body;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!track) return status.missingBodyParam(res, 'track');

  await podsData.addTrackToPlayHistory(podId, track);

  return status.success(res, {
    message: `Added track [${track.name}] to pod [${podId}] play history`
  });
});

pods.patch('/:podId/activeMembers', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;
  const { user } = req.body;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!user) return status.missingBodyParam(res, 'user');

  await podsData.addActiveMember(podId, user);
  await podsData.addMember(podId, user);

  return status.success(res, {
    message: `Added active user [${user.name}] to pod [${podId}]`
  });
});

pods.post('/:podId/activeMembers/:userId', async (req: Request<{ podId: string; userId: string }>, res: Response) => {
  const { podId, userId } = req.params;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');

  const { notAMember } = await podsData.removeActiveMember(podId, userId);
  if (notAMember) return status.doesNotExist(res, 'Member', userId, `pod [${podId}]`);

  return status.success(res, {
    message: `Removed active member [${userId}] from pod [${podId}]`
  });
});

pods.put('/:podId/launch', async (req: Request<{ podId: string }>, res: Response) => {
  const { podId } = req.params;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');

  pusher.trigger(podId, LAUNCH_GAME, {});

  return status.success(res, {
    message: `Launching Pod ${podId}`
  });
});

export default pods;
