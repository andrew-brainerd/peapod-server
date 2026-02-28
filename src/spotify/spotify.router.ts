import { Router, type Request, type Response, type NextFunction } from 'express';
import { spotifyApi } from './spotify.client.js';
import { formatUrlParams } from '../common/url.js';
import { AUTH_URL, SCOPES, SEARCH_TYPES, DEFAULT_SEARCH_OPTIONS } from './spotify.constants.js';
import * as status from '../common/statusMessages.js';
import * as log from '../common/logger.js';

const spotify = Router();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;
const frontendUrl = process.env.PEAPOD_UI_URL;

const extractSpotifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return status.missingQueryParam(res, 'Authorization header (Bearer token)');
  }
  const token = authHeader.slice(7);
  spotifyApi.setAccessToken(token);
  next();
};

spotify.get('/auth', async (_req: Request, res: Response) => {
  const params = formatUrlParams({
    response_type: 'code',
    client_id: clientId!,
    scope: encodeURIComponent(SCOPES),
    redirect_uri: encodeURIComponent(redirectUri),
  });

  res.send({ authUrl: `${AUTH_URL}${params}` });
});

spotify.post('/auth', async (req: Request, res: Response) => {
  const {
    body: { accessToken, refreshToken },
  } = req;

  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);

  try {
    const response = await spotifyApi.refreshAccessToken();
    status.success(res, { response });
  } catch (err) {
    console.error(err);
    status.serverError(res, err, 'Refresh Failed');
  }
});

spotify.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    const {
      body: { access_token, expires_in, refresh_token },
    } = await spotifyApi.authorizationCodeGrant(code as string);

    const params = formatUrlParams({
      access_token,
      expires_in,
      refresh_token,
    });

    res.redirect(`${frontendUrl}/spotify/auth${params}`);
  } catch (err) {
    log.error('Authorization Failed', err as Record<string, unknown>);
    status.serverError(res, err, 'Authorization Failed');
  }
});

spotify.get('/profile', extractSpotifyToken, async (_req: Request, res: Response) => {
  try {
    const data = await spotifyApi.getMe();
    status.success(res, { ...data.body });
  } catch (err) {
    log.error('Failed to fetch user profile', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to fetch user profile');
  }
});

spotify.get('/artistAlbums', extractSpotifyToken, async (_req: Request, res: Response) => {
  const artistId = '4xRYI6VqpkE3UwrDrAZL8L';

  try {
    const data = await spotifyApi.getArtistAlbums(artistId);
    status.success(res, { ...data.body });
  } catch (err) {
    log.error('Failed to fetch artist albums', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to fetch artist albums');
  }
});

spotify.get('/myTopTracks', extractSpotifyToken, async (_req: Request, res: Response) => {
  try {
    const data = await spotifyApi.getMyTopTracks();
    status.success(res, { ...data.body });
  } catch (err) {
    log.error('Failed to fetch user top tracks', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to fetch user top tracks');
  }
});

spotify.post('/search', extractSpotifyToken, async (req: Request, res: Response) => {
  const { searchText, types, options } = req.body;

  if (!searchText) return status.missingBodyParam(res, 'searchText');

  const invalidTypes = (types || []).filter((type: string) => !SEARCH_TYPES.includes(type));
  if (invalidTypes.length > 0)
    return status.serverError(res, null, `Invalid types provided: ${invalidTypes}`);

  const searchTypes = types || SEARCH_TYPES;
  const searchOptions = options || DEFAULT_SEARCH_OPTIONS;

  try {
    const data = await spotifyApi.search(searchText, searchTypes, searchOptions);
    status.success(res, { ...data.body });
  } catch (err) {
    log.error(`Failed to search for [${searchText}]`, err as Record<string, unknown>);
    status.serverError(res, err, `Failed to search for [${searchText}]`);
  }
});

spotify.get('/myDevices', extractSpotifyToken, async (_req: Request, res: Response) => {
  try {
    const data = await spotifyApi.getMyDevices();
    status.success(res, { ...data.body });
  } catch (err) {
    log.error('Failed to fetch user devices', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to fetch user devices');
  }
});

spotify.get('/myPlaybackState', extractSpotifyToken, async (_req: Request, res: Response) => {
  try {
    const data = await spotifyApi.getMyCurrentPlaybackState();
    status.success(res, { ...data.body });
  } catch (err) {
    log.error('Failed to fetch user current playback state', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to fetch user current playback state');
  }
});

spotify.get('/myNowPlaying', extractSpotifyToken, async (_req: Request, res: Response) => {
  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    status.success(res, { ...data.body });
  } catch (err) {
    log.error('Failed to fetch user currently playing', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to fetch user currently playing');
  }
});

spotify.put('/transferPlayback', extractSpotifyToken, async (req: Request, res: Response) => {
  const { devices, shouldPlay = true } = req.body;

  if (!devices) return status.missingBodyParam(res, 'devices');

  try {
    await spotifyApi.transferMyPlayback(devices, { play: shouldPlay });
    status.success(res, { message: 'Playback transferred' });
  } catch (err) {
    log.error('Failed to transfer user playback', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to transfer user playback');
  }
});

spotify.put('/play', extractSpotifyToken, async (req: Request, res: Response) => {
  const { contextUri, uris, offset, position } = req.body;

  if (contextUri && uris)
    return status.serverError(res, null, 'Provide only one: contextUri or uris');

  const options: Record<string, unknown> = {};

  if (contextUri) {
    options.context_uri = contextUri;
    options.offset = offset || {};
  }

  if (uris) {
    options.uris = uris;
  }

  if (position) {
    options.position_ms = position;
  }

  try {
    await spotifyApi.play(options);
    status.success(res, { message: 'Playing' });
  } catch (err) {
    log.error('Failed to play', err as Record<string, unknown>);
    status.serverError(res, err);
  }
});

spotify.put('/pause', extractSpotifyToken, async (_req: Request, res: Response) => {
  log.cool('Pausing');

  try {
    await spotifyApi.pause();
    status.success(res, { message: 'Paused' });
  } catch (err) {
    log.error('Failed to pause', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to pause');
  }
});

spotify.post('/playlist', extractSpotifyToken, async (req: Request, res: Response) => {
  const { userId, name } = req.body;

  log.cool(`Creating Playlist [${name}] for user [${userId}]`);

  try {
    const data = await spotifyApi.createPlaylist(userId, name);
    status.success(res, { ...data.body });
  } catch (err) {
    log.error('Failed to create playlist', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to create playlist');
  }
});

spotify.put('/playlists', extractSpotifyToken, async (req: Request, res: Response) => {
  const { id, tracks } = req.body;

  try {
    const data = await spotifyApi.addTracksToPlaylist(id, tracks);
    status.success(res, { ...data.body });
  } catch (err) {
    log.error('Failed to add tracks to playlist', err as Record<string, unknown>);
    status.serverError(res, err, 'Failed to add tracks to playlist');
  }
});

spotify.get(
  '/playlists/:userId',
  extractSpotifyToken,
  async (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;

    if (!userId) return status.missingQueryParam(res, 'userId');

    try {
      const data = await spotifyApi.getUserPlaylists(userId);
      status.success(res, { ...data.body });
    } catch (err) {
      log.error('Failed to fetch user playlists', err as Record<string, unknown>);
      status.serverError(res, err, 'Failed to fetch user playlists');
    }
  },
);

export default spotify;
