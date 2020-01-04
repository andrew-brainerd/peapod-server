const spotify = require('express').Router();
const { spotifyApi } = require('../../utils/spotify');
const { formatUrlParams } = require('../../utils/url');
const { SPOTIFY_AUTH_URL, SCOPES } = require('../../constants/spotify');
const status = require('../../constants/statusMessages');
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

      log.cool(`Redirecting to ${frontendUrl}/spotify/auth${params}`);
      res.redirect(`${frontendUrl}/spotify/auth${params}`);
    })
    .catch(err => log.error('Authorization Failed', err));
});

spotify.get('/artistAlbums', async (req, res) => {
  const { query: { accessToken } } = req;
  const artistId = '4xRYI6VqpkE3UwrDrAZL8L';

  spotifyApi.setAccessToken(accessToken);

  if (!accessToken) log.error('No access token');

  spotifyApi.getArtistAlbums(artistId)
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to fetch user playlists', err));
});

module.exports = spotify;
