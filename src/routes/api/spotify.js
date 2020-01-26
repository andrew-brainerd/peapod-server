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

spotify.post('/auth', async (req, res) => {
  const { body: { accessToken, refreshToken } } = req;

  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);

  spotifyApi.refreshAccessToken()
    .then(response => {
      status.success(res, { response });
    })
    .catch(err => {
      console.error(err);
      status.serverError(res, err, 'Refresh Failed');
    });
});

spotify.get('/callback', async (req, res) => {
  const { query: { code } } = req;

  spotifyApi.authorizationCodeGrant(code)
    .then(({ body: { access_token, expires_in, refresh_token } }) => {
      const params = formatUrlParams({
        access_token,
        expires_in,
        refresh_token
      });

      res.redirect(`${frontendUrl}/spotify/auth${params}`);
    })
    .catch(err => log.error('Authorization Failed', err));
});

spotify.get('/artistAlbums', async (req, res) => {
  const { query: { accessToken } } = req;
  const artistId = '4xRYI6VqpkE3UwrDrAZL8L';

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getArtistAlbums(artistId)
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to fetch user playlists', err));
});

spotify.get('/myTopTracks', async (req, res) => {
  const { query: { accessToken } } = req;

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMyTopTracks()
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to fetch user top tracks', err));
});

module.exports = spotify;
