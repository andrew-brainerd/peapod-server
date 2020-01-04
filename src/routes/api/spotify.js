const spotify = require('express').Router();
const { spotifyApi } = require('../../utils/spotify');
const { SPOTIFY_AUTH_URL, SCOPES } = require('../../constants/spotify');
const { formatUrlParams } = require('../../utils/url');
const log = require('../../utils/log');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
const frontendUrl = process.env.PEAPOD_UI_URL;

spotify.get('/auth', async (req, res) => {
  const params = formatUrlParams({
    response_type: 'code',
    client_id: clientId,
    scope: encodeURIComponent(SCOPES),
    redirect_uri: encodeURIComponent(redirectUri)
  });

  res.send({ authUrl: `${SPOTIFY_AUTH_URL}${params}` });
});

spotify.get('/callback', async (req, res) => {
  const { query: { code } } = req;

  spotifyApi.authorizationCodeGrant(code)
    .then(({ body: { access_token, expires_in, refresh_token } }) => {
      const params = formatUrlParams({
        access_token,
        expires_in,
        refresh_token
      })

      res.redirect(`${frontendUrl}/spotify/auth${params}`);
    })
    .catch(err => log.error('Authorization Failed', err));
});

module.exports = spotify;
