const isEmpty = require('lodash/isEmpty');
const spotify = require('express').Router();
const { spotifyApi } = require('../../utils/spotify');
const { formatUrlParams } = require('../../utils/url');
const {
  AUTH_URL,
  SCOPES,
  SEARCH_TYPES,
  DEFAULT_SEARCH_OPTIONS
} = require('../../constants/spotify');
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

  res.send({ authUrl: `${AUTH_URL}${params}` });
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

spotify.get('/profile', async (req, res) => {
  const { query: { accessToken } } = req;

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMe()
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to fetch user profile', err));
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

spotify.post('/search', async (req, res) => {
  const { query: { accessToken }, body: { searchText, types, options } } = req;

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  if (!searchText) return status.missingBodyParam(res, 'searchText');
  spotifyApi.setAccessToken(accessToken);

  const invalidTypes = (types || []).filter(type => !types.includes(type));
  if (!isEmpty(invalidTypes)) return status.serverError(res, null, `Invalid types provided: ${invalidTypes}`);

  const searchTypes = types || SEARCH_TYPES;
  const searchOptions = options || DEFAULT_SEARCH_OPTIONS;

  spotifyApi.search(searchText, searchTypes, searchOptions)
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error(`Failed to search for [${searchText}]`, err));
});

spotify.get('/myDevices', async (req, res) => {
  const { query: { accessToken } } = req;

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMyDevices()
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to fetch user devices', err));
});

spotify.get('/myPlaybackState', async (req, res) => {
  const { query: { accessToken } } = req;

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMyCurrentPlaybackState()
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to fetch user current playback state', err));
});

spotify.get('/myNowPlaying', async (req, res) => {
  const { query: { accessToken } } = req;

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMyCurrentPlayingTrack()
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to fetch user currently playing', err));
});

spotify.put('/transferPlayback', async (req, res) => {
  const { query: { accessToken }, body: { devices, shouldPlay = true } } = req;

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  if (!devices) return status.missingBodyParam(res, 'devices');
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.transferMyPlayback({ deviceIds: devices, play: shouldPlay })
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to tranfer user playback', err));
});

spotify.put('/play', async (req, res) => {
  const { query: { accessToken }, body: { contextUri, uris, offset, position } } = req;

  console.log('Body: %o', req.body);

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  // if (!contextUri && !uris) return status.missingBodyParam(res, 'contextUri or uris');
  if (!!contextUri && !!uris) return status.serverError(res, null, 'Provide only one: contextUri or uris');
  spotifyApi.setAccessToken(accessToken);

  const options = {};

  if (!!contextUri) {
    options.context_uri = contextUri;
    options.offset = offset || {};
  }

  if (!!uris) {
    options.uris = uris;
  }

  if (!!position) {
    options.position_ms = position;
  }

  console.log(options);

  spotifyApi.play(options)
    .then(data => {
      log.cool(`Playing %o`, uris);
      status.success(res, { ...data.body })
    }) 
    .catch(err => {
      log.error('Failed to play', err);
      status.serverError(res, err);
    });
});

spotify.put('/pause', async (req, res) => {
  const { query: { accessToken } } = req;

  if (!accessToken) return status.missingQueryParam(res, 'accessToken');
  spotifyApi.setAccessToken(accessToken);

  log.cool(`Pausing`);

  spotifyApi.pause()
    .then(data => status.success(res, { ...data.body }))
    .catch(err => log.error('Failed to play', err));
});

module.exports = spotify;
