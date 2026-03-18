# Peapod Server

Backend API for the Peapod app — a Spotify jukebox that connects friends and partners who want to listen to music together. Each "jukebox" is a **pod**: a group of people with a synced queue, play history, and real-time playback updates.

This server handles pod management, Spotify OAuth/API proxying, real-time sync via Pusher, and SMS invitations via Twilio.

## Tech Stack

- **Runtime**: Node.js 24+, TypeScript, ES modules
- **Framework**: Express 5
- **Database**: MongoDB 7 (native driver, MongoDB Atlas)
- **Real-time**: Pusher (server-side triggers)
- **Music API**: spotify-web-api-node
- **SMS**: Twilio
- **Validation**: Zod
- **Security**: Helmet, CORS, express-rate-limit
- **Testing**: Vitest (integration tests)
- **Build**: tsc → `dist/`
- **Linting**: ESLint 10 (flat config), Prettier
- **Package Manager**: pnpm
- **Container**: Docker (multi-stage, Chainguard base)

## Project Structure

```
src/
├── server.ts               # Entry point — Express app, middleware, graceful shutdown
├── api/
│   └── index.ts            # Route aggregator
├── common/
│   ├── db.ts               # MongoDB connection & generic CRUD operations
│   ├── collections.ts      # Collection name constants
│   ├── logger.ts           # Chalk-based colored logging
│   ├── error.ts            # Error utilities
│   ├── messaging.ts        # Twilio SMS client
│   ├── notifications.ts    # Pusher client instance
│   ├── pusherEvents.ts     # Event name constants (NOW_PLAYING, MEMBER_ADDED, LAUNCH_GAME)
│   ├── responseCodes.ts    # HTTP status code constants
│   ├── statusMessages.ts   # Response helpers
│   └── url.ts              # URL formatting utilities
├── middleware/
│   └── authentication.ts   # Bearer token auth middleware
├── pods/
│   ├── pods.router.ts      # Pod CRUD & management endpoints
│   └── pods.repository.ts  # Pod data operations (MongoDB queries)
├── spotify/
│   ├── spotify.router.ts   # Spotify OAuth & API proxy endpoints
│   ├── spotify.client.ts   # Spotify Web API client init
│   └── spotify.constants.ts # OAuth scopes & constants
└── sync/
    └── sync.router.ts      # Real-time now-playing broadcast via Pusher
tests/
├── api.test.ts             # Health/welcome endpoint tests
├── pods.test.ts            # Pod CRUD integration tests
└── helpers.ts              # Test utilities (base URL, pod creation helpers)
```

## API Endpoints

```
GET    /api                              # Welcome + version
GET    /api/health                       # Health check

# Spotify OAuth & API (auth extracted per-request)
GET    /api/spotify/auth                 # Get OAuth URL
POST   /api/spotify/auth                 # Validate refresh token
GET    /api/spotify/callback             # OAuth callback → redirect to UI
GET    /api/spotify/profile              # User profile
GET    /api/spotify/myTopTracks          # Top tracks
POST   /api/spotify/search              # Search tracks/albums/artists
GET    /api/spotify/myDevices            # Available devices
GET    /api/spotify/myPlaybackState      # Current playback
GET    /api/spotify/myNowPlaying         # Currently playing track
PUT    /api/spotify/play                 # Start playback
PUT    /api/spotify/pause                # Pause playback
PUT    /api/spotify/transferPlayback     # Switch device
POST   /api/spotify/playlist             # Create playlist
PUT    /api/spotify/playlists            # Add tracks to playlist
GET    /api/spotify/playlists/:userId    # User's playlists

# Pods (all require auth)
GET    /api/pods                         # List pods (paginated)
POST   /api/pods                         # Create pod
GET    /api/pods/:podId                  # Get pod
DELETE /api/pods/:podId                  # Delete pod
PATCH  /api/pods/:podId/members          # Add member
DELETE /api/pods/:podId/members          # Remove member
PATCH  /api/pods/:podId/queue            # Add track to queue
DELETE /api/pods/:podId/queue            # Remove track from queue
PATCH  /api/pods/:podId/history          # Add track to history
PATCH  /api/pods/:podId/activeMembers    # Add active member
POST   /api/pods/:podId/activeMembers/:userId  # Remove active member
PUT    /api/pods/:podId/launch           # Trigger launch event
POST   /api/pods/:podId/invite           # Send SMS invite

# Sync (requires auth)
POST   /api/sync?podId=...              # Broadcast now-playing via Pusher
```

## Data Model

**pods** collection:
```
{
  _id: ObjectId
  createdBy: { id, name, email?, display_name? }
  members: [{ id, name, email?, display_name? }]
  activeMembers: [userId strings]
  queue: [{ id, name, artist? }]
  history: [{ id, name, artist? }]
}
```

## Commands

- `pnpm dev` — Dev server with hot reload (port 3001) + SSL proxy (port 3443)
- `pnpm start` — Run server via tsx
- `pnpm build` — Compile TypeScript to `dist/`
- `pnpm test` — Run Vitest integration tests
- `pnpm test:watch` — Tests in watch mode
- `pnpm lint` — ESLint
- `pnpm format` — Prettier

## Key Patterns

- **Auth**: Bearer token middleware on pod and sync routes; Spotify token extracted per-request and set on shared client
- **Real-time**: Pusher triggers on pod channel (channel name = pod ID) for NOW_PLAYING, MEMBER_ADDED, LAUNCH_GAME events
- **Data layer**: Generic MongoDB CRUD in `common/db.ts`, domain operations in `pods.repository.ts`
- **Spotify proxy**: Server holds client credentials; user access tokens forwarded from frontend
- **SMS invites**: Twilio sends pod invitation links
- **Graceful shutdown**: SIGTERM/SIGINT handlers close MongoDB connection

## Environment Variables

```
# Database
MONGODB_URI              # MongoDB Atlas connection string
DB_NAME                  # Database name (e.g., "pods")

# Spotify OAuth
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SPOTIFY_REDIRECT_URI     # Must match Spotify app settings
PEAPOD_UI_URL            # Frontend URL for OAuth redirect

# Pusher
PUSHER_APP_ID
PUSHER_APP_KEY
PUSHER_APP_SECRET
PUSHER_CLUSTER           # e.g., "us2"

# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_PHONE_NUMBER

# Optional
PORT                     # Default: 3001
```
