const notify = require('express').Router();
const fetch = require('node-fetch')
const status = require('../../constants/statusMessages');

const DISCORD_URL = 'https://discordapp.com/api'
const PEAPOD_CHANNEL = '678429686480502787/fmd1n7lXPNOPNnvR6cUK5gxRBXo-B4HnCGQRliYYU4wPqo9lgTWYOtSrjfKXl6jfDJtf';

notify.post('/discord', async (req, res) => {
  const { body } = req;
  const { message } = body;

  console.log(body);

  await fetch(`${DISCORD_URL}/webhooks/${PEAPOD_CHANNEL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
    },
    body: JSON.stringify({
      content: message
    })
  });

  return status.created(res, { message });
});

module.exports = notify;
