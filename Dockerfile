# Multi-stage build for WebEDT monorepo
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY tsconfig.base.json ./

# Copy all packages
COPY packages ./packages
COPY apps ./apps

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build

WORKDIR /app

# Build client (React/Vite app)
RUN pnpm --filter @webedt/client build

# Build server (Express API)
RUN pnpm --filter @webedt/server build

# Production stage
FROM node:20-alpine AS production

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY tsconfig.base.json ./

# Copy package.json files for all workspaces
COPY packages/shared/package.json ./packages/shared/
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/

# Install all dependencies (needed for rebuilding native modules)
RUN pnpm install --frozen-lockfile

# Rebuild native modules for Alpine Linux
RUN pnpm rebuild better-sqlite3 bcrypt

# Copy built artifacts from build stage
COPY --from=build /app/apps/client/dist ./apps/client/dist
COPY --from=build /app/apps/server/dist ./apps/server/dist

# Copy server source files that may be needed at runtime
COPY apps/server/.env* ./apps/server/

# Expose port 3000 (unified server port)
EXPOSE 3000

# Set working directory to server
WORKDIR /app/apps/server

# Start the server
CMD ["node", "dist/index.js"]
