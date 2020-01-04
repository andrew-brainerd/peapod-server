const SpotifyWebApi = require('spotify-web-api-node');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

const spotifyApi = new SpotifyWebApi({ clientId, clientSecret, redirectUri });

module.exports = {
  spotifyApi
};
