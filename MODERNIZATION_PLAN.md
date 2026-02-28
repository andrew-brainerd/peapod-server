# Peapod Server Modernization Plan

## Current State Summary

The Peapod server is an Express.js API (Node 22, Express 4) that powers a collaborative music listening app. It integrates with Spotify (playback/search), Pusher (real-time events), SignalWire (SMS invites), and MongoDB (data storage). The codebase uses CommonJS modules, callback-based MongoDB operations wrapped in Promises, and has no authentication despite having `express-jwt` and `jwks-rsa` installed. Tests are written in Python using pytest.

---

## Phase 1: Foundation — Tooling & Language

### 1.1 Migrate to ESM (ES Modules)
- Replace all `require()` / `module.exports` with `import` / `export`
- Add `"type": "module"` to `package.json`
- Update ESLint config accordingly (replace `eslint-plugin-node` with `eslint-plugin-n`)

### 1.2 Migrate to TypeScript
- Add `typescript`, `tsx`, `@types/express`, `@types/node` as dev dependencies
- Create `tsconfig.json` with strict mode enabled
- Rename `.js` files to `.ts`
- Add types to all functions, request handlers, and data models
- Define interfaces for core domain objects: `Pod`, `Member`, `Track`, `SpotifyTokens`

### 1.3 Upgrade ESLint
- Upgrade from ESLint 6 to ESLint 9+ (flat config)
- Replace `.eslintrc` with `eslint.config.js`
- Add `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`
- Replace deprecated `eslint-plugin-node` with `eslint-plugin-n`
- Add Prettier for formatting (with `eslint-config-prettier`)

### 1.4 Upgrade Husky
- Upgrade from husky 3 to husky 9+
- Run `pnpm approve-builds` to allow husky install scripts
- Migrate husky config from `package.json` to `.husky/` directory
- Add a pre-commit hook running lint-staged (lint + format only changed files)

### 1.5 Add a Dev Server
- Add `tsx --watch` or `nodemon` with `ts-node` for hot-reload during development
- Update the `dev` script in `package.json`

---

## Phase 2: Express & Middleware

### 2.1 Upgrade to Express 5
- Upgrade `express` from v4 to v5
- Express 5 natively supports async route handlers (no more `express-async-errors`)
- Update any middleware relying on Express 4-specific behavior
- Remove deprecated `req.param()` usage if present

### 2.2 Add Proper Error Handling
- Add a global Express error-handling middleware (`(err, req, res, next)`)
- Replace the ad-hoc `status.*` response helpers with a custom `AppError` class that carries HTTP status codes
- Ensure all async routes propagate errors correctly
- Fix silent failures in Spotify routes where `.catch()` logs but sends no response

### 2.3 Add Input Validation
- Add `zod` for request body/query/param validation
- Create validation schemas for each endpoint's expected input
- Add a reusable `validate()` middleware that returns 400 with structured errors
- Remove the custom `sendMissingParam` / `sendAlreadyExists` helpers from the response object

### 2.4 Tighten CORS
- Replace the wildcard `*` CORS headers with the `cors` package
- Configure an allowlist of origins (at minimum `PEAPOD_UI_URL`)
- Move CORS config to environment variables

### 2.5 Add Rate Limiting
- Add `express-rate-limit` with sensible defaults
- Apply stricter limits to auth and SMS endpoints

---

## Phase 3: Database

### 3.1 Upgrade MongoDB Driver
- Upgrade `mongodb` from v3 to v6+
- The v6 driver is fully Promise-based — remove all callback wrappers in `src/utils/data.js`
- Use the modern `MongoClient` connection pattern (no deprecated options)
- Add proper connection lifecycle management (connect on startup, close on shutdown via `SIGTERM`/`SIGINT`)

### 3.2 Improve Data Layer
- Replace the generic `data.js` utility functions with domain-specific repository modules (e.g., `pods.repository.ts`)
- Use TypeScript types for all documents and query results
- Add MongoDB indexes for common query patterns (e.g., `members.id` on the pods collection)
- Replace the `getSome` pagination (which fetches all docs to count) with `countDocuments()` + `find().skip().limit()`

### 3.3 Consider Mongoose (Optional)
- Evaluate whether adding Mongoose is worthwhile for schema validation, middleware hooks, and populated references
- If the app stays small, the raw driver with Zod validation at the API layer may be sufficient

---

## Phase 4: Authentication & Security

### 4.1 Implement JWT Authentication
- `express-jwt` and `jwks-rsa` are already installed but unused — wire them up
- Add auth middleware that validates JWTs on protected routes
- Decide on an identity provider (Auth0, Firebase Auth, or custom)
- Make public routes explicit (e.g., health check, Spotify OAuth callback)

### 4.2 Fix Token Handling
- Move Spotify access tokens from query parameters to the `Authorization` header (query params leak into logs and browser history)
- Store refresh tokens server-side rather than passing them from the client

### 4.3 Add Security Headers
- Add `helmet` middleware for secure HTTP headers
- Ensure `X-Content-Type-Options`, `Strict-Transport-Security`, etc. are set

### 4.4 Validate SMS Recipients
- Validate phone number format before calling SignalWire
- Add authorization checks so only pod members can send invites

---

## Phase 5: Dependency Cleanup

### 5.1 Remove Unused Dependencies
- Remove `errorhandler` (imported in `package.json` but never used)
- Remove `express-jwt` and `jwks-rsa` if not implementing JWT auth immediately, or wire them up (Phase 4)

### 5.2 Upgrade Outdated Packages
| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| `dotenv` | 6.x | 17.x | Minimal API changes |
| `chalk` | 2.x | 5.x | v5 is ESM-only; works after Phase 1.1 |
| `pusher` | 3.x | 5.x | Review changelog for breaking changes |
| `node-fetch` | 2.x | 3.x | v3 is ESM-only, or switch to native `fetch` (available in Node 22) |
| `spotify-web-api-node` | 4.x | 5.x | Check for breaking changes |
| `@signalwire/node` | 2.x | 3.x | Review migration guide |
| `jsonwebtoken` | 8.x | 9.x | Security fixes |
| `concurrently` | 3.x | 9.x | Dev dependency, safe to upgrade |

### 5.3 Replace `node-fetch` with Native `fetch`
- Node 22 has built-in `fetch` — remove the `node-fetch` dependency entirely
- Update all `require('node-fetch')` call sites

### 5.4 Replace `lodash` with Native Methods
- Audit usage of `lodash` — if only using a few utility functions (e.g., `_.get`, `_.pick`), replace with native equivalents (`?.` optional chaining, destructuring, `Object.pick` proposal, etc.)
- Remove `lodash` if no longer needed

---

## Phase 6: Testing

### 6.1 Replace Python Tests with JavaScript/TypeScript Tests
- Add `vitest` (fast, TypeScript-native, ESM-friendly)
- Rewrite existing integration tests from Python/pytest to TypeScript
- Keep the same test coverage: pod CRUD, member management, queue operations

### 6.2 Add Unit Tests
- Add unit tests for data layer functions, validation schemas, and utility modules
- Mock MongoDB and external services (Pusher, SignalWire, Spotify)

### 6.3 Update Test Scripts
- Replace the `test` script (`cd tests && pipenv install && pipenv run pytest`) with `vitest`
- Remove the `tests/` Python directory once migration is complete
- Add test coverage reporting

---

## Phase 7: Infrastructure & DX

### 7.1 Update Dockerfile
- Update base image from `node:10-alpine` to `node:22-alpine`
- Replace `yarn install` with `pnpm install --frozen-lockfile`
- Add a multi-stage build (build stage for TypeScript compilation, runtime stage for production)
- Add `.dockerignore` to exclude `node_modules`, `tests`, `.git`, etc.
- Add a `HEALTHCHECK` instruction

### 7.2 Add Health Check Endpoint
- Add `GET /api/health` that checks MongoDB connectivity and returns service status
- Use this for Docker health checks and load balancer probes

### 7.3 Improve Logging
- Replace the custom `chalk`-based logger with a structured logging library (`pino` recommended for Express)
- Log request method, path, status code, and duration for every request
- Add request ID tracking via middleware

### 7.4 Add Graceful Shutdown
- Handle `SIGTERM` and `SIGINT` signals
- Close the MongoDB connection and stop accepting new requests before exiting
- Drain in-flight requests

### 7.5 Environment Configuration
- Add a `.env.example` file documenting all required environment variables
- Add startup validation that all required env vars are present (fail fast with clear messages)

---

## Phase 8: Code Organization (Optional)

### 8.1 Restructure to Feature Modules
Consider reorganizing from the current layered structure:
```
src/
├── api/          # Routes
├── constants/    # Config values
├── data/         # DB queries
└── utils/        # Everything else
```

To a feature-based structure:
```
src/
├── pods/
│   ├── pods.router.ts
│   ├── pods.repository.ts
│   ├── pods.schemas.ts        # Zod schemas
│   └── pods.types.ts
├── spotify/
│   ├── spotify.router.ts
│   ├── spotify.client.ts
│   └── spotify.types.ts
├── sync/
│   ├── sync.router.ts
│   └── sync.types.ts
├── common/
│   ├── middleware/
│   ├── errors.ts
│   ├── db.ts
│   └── logger.ts
└── server.ts
```

This keeps related code co-located and makes each feature easier to reason about independently.

---

## Recommended Execution Order

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| 1 | Phase 5: Dependency Cleanup | Low | Reduces attack surface, removes dead code |
| 2 | Phase 2: Express & Middleware | Medium | Fixes error handling, validation, security basics |
| 3 | Phase 7.1: Dockerfile | Low | Unblocks deployments on modern Node |
| 4 | Phase 1: Tooling & Language | High | Enables type safety, modern syntax across codebase |
| 5 | Phase 3: Database | Medium | Removes callback patterns, improves performance |
| 6 | Phase 4: Authentication | Medium | Critical for any production use |
| 7 | Phase 6: Testing | Medium | Enables safe refactoring |
| 8 | Phase 7.2–7.5: Infrastructure | Low | Operational improvements |
| 9 | Phase 8: Code Organization | Low | Nice-to-have, can be done incrementally |
