ARG NODE_VERSION=24.21.0
FROM node:${NODE_VERSION}-slim AS base

# ---
FROM base AS prepare
# Set working directory
WORKDIR /app
RUN npm install --global turbo
COPY . .
# Add lockfile and package.json's of isolated subworkspace
RUN turbo prune web --docker

# ---
FROM base AS builder
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=prepare /app/out/json/ .
RUN npm install

# Build the project
COPY --from=prepare /app/out/full/ .

# Build arguments for public env vars
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npx turbo build --filter=web

# ---
FROM node:${NODE_VERSION}-alpine AS runner
# Don't run production as root for security reasons
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
