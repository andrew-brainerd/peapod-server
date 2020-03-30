const sync = require('express').Router();
const { pusher } = require('../utils/notifications');
const { isDefined } = require('../utils/url');
const status = require('../constants/statusMessages');
const { NOW_PLAYING } = require('../constants/pusher');

sync.post('/', async (req, res) => {
  const { query: { podId }, body: { nowPlaying } } = req;

  if (!isDefined(podId)) return status.missingQueryParam(res, 'podId');
  if (!nowPlaying) return status.missingBodyParam(res, 'nowPlaying');

  pusher.trigger(podId, NOW_PLAYING, { ...nowPlaying });

  return status.created(res, { message: 'Pushed Now Playing Update', nowPlaying });
});

module.exports = sync;
