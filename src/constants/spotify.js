const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played'
].join(' ');

module.exports = {
  SPOTIFY_AUTH_URL,
  SCOPES
};
