FROM cgr.dev/chainguard/node:latest-dev AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src/ src/
RUN pnpm build

FROM cgr.dev/chainguard/node:latest AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules node_modules/
COPY --from=build /app/dist dist/
COPY package.json ./

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))" || exit 1

CMD ["dist/server.js"]
