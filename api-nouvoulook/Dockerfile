# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

###############################
# Build stage
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update -y && apt-get install -y openssl

# Install build dependencies only (no .env, no .git, no lock files in image)
COPY --link package.json ./
COPY --link package-lock.json ./

# Use npm ci for deterministic builds, cache npm
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the application (excluding .env, .git, etc. via .dockerignore)
COPY --link . .

# Build the TypeScript app (NestJS)
RUN npm run build

# Remove dev dependencies and reinstall only production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --production

RUN mkdir -p /app/public/assets && chmod -R 777 /app/public/assets

###############################
# Production stage
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Create a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy built app and production node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy public assets (for static files)
COPY --from=builder /app/public ./public

# Copy Prisma schema and migrations (for runtime migrations, if needed)
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Use non-root user
USER appuser

# Expose the default NestJS port (as per main.ts and README)
EXPOSE 3001

# Start the application with Prisma migrations et seed
CMD npx prisma migrate deploy && npx prisma db seed && npm run start:prod
