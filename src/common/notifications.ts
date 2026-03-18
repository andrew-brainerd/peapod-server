import Pusher from 'pusher';

const appId = process.env.PUSHER_APP_ID!;
const appKey = process.env.PUSHER_APP_KEY!;
const appSecret = process.env.PUSHER_APP_SECRET!;

export const pusher = new Pusher({
  appId,
  key: appKey,
  secret: appSecret,
  cluster: 'us2',
  useTLS: true
});
