ARG NODE_VERSION=24.21.0
FROM node:${NODE_VERSION}-slim AS base

FROM base AS prepare
# Set working directory
WORKDIR /app
RUN npm install --global turbo
COPY . .
RUN turbo prune api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS builder
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=prepare /app/out/json/ .
RUN npm install

# Build the project and its dependencies
COPY --from=prepare /app/out/full/ .

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/src/prisma/schema.prisma

# Build API workspace
RUN npx turbo build --filter=api

FROM node:${NODE_VERSION}-alpine AS runner
# Install openssl and libc6-compat for Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs
COPY --from=builder --chown=expressjs:expressjs /app .

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --config=apps/api/prisma.config.ts && node apps/api/dist/src/main.js"]