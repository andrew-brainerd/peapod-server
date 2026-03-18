export const AUTH_URL = 'https://accounts.spotify.com/authorize';

export const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private'
].join(' ');

export const SEARCH_TYPES = ['album', 'artist', 'playlist', 'track'];

export const DEFAULT_SEARCH_OPTIONS = {
  limit: 20
};
