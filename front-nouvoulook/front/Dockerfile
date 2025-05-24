# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Install dependencies with cache and bind mounts for deterministic builds
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the application source code (excluding files in .dockerignore)
COPY --link . .

# Build the Astro project
RUN npm run build

# ---
# Production image
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Create a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Installer curl pour le debug réseau
RUN apt-get update -y && apt-get install -y curl

# Copy built app and production dependencies only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV HOST=0.0.0.0
ENV PORT=4321
USER appuser

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
