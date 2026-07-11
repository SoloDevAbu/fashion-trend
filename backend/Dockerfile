FROM node:22-bookworm AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY tsconfig.json drizzle.config.ts ./
COPY src ./src

RUN pnpm build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN npx playwright install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

COPY drizzle ./drizzle

RUN mkdir -p .crawlee && chmod -R 777 .crawlee

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["pnpm", "start"]
