# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

# --- Builder stage ---
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Install dependencies (npm ci for deterministic builds)
COPY --link package.json package.json
COPY --link package-lock.json package-lock.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the application source
COPY --link . .

# Build the Angular app (production build)
RUN npm run build

# --- Production stage ---
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Install http-server globally before creating non-root user
RUN npm install -g http-server@14.1.1

# Create a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy built app and only necessary files
COPY --from=builder /app/dist/admin ./dist/admin
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
USER appuser

EXPOSE 8080

CMD ["http-server", "dist/admin/browser", "-p", "8080", "-c-1", "-P", "http://localhost:8080?/"]
