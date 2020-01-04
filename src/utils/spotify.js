const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: 'cc338a93245149fa9bd6de8ae3eee1a7',
  clientSecret: '0132593cfeb04ad98229bfc6d78243c4',
  redirectUri: 'http://localhost:5000/api/spotify/callback'
});

module.exports = {
  spotifyApi
};
