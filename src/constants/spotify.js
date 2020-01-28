const AUTH_URL = 'https://accounts.spotify.com/authorize';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private'
].join(' ');

const SEARCH_TYPES = [
  'album',
  'artist',
  'playlist',
  'track'
];

const DEFAULT_SEARCH_OPTIONS = {
  limit: 20
};

module.exports = {
  AUTH_URL,
  SCOPES,
  SEARCH_TYPES,
  DEFAULT_SEARCH_OPTIONS
};
