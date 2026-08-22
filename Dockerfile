# =============================================================================
# Stage 1: Install dependencies
# =============================================================================
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app

# Copy only package files first (better caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy preinstall.js for Husky setup (skipped in CI)
COPY preinstall.js ./
# Skip prepare script in Docker (Husky not needed)
ENV CI=true
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 2: Build
# =============================================================================
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build in app mode
ENV BUILD_MODE=app
RUN pnpm build

# =============================================================================
# Stage 3: Production runtime
# =============================================================================
FROM node:20-alpine AS runtime

# Security: create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/package.json ./

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HEALTH_PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Switch to non-root user
USER appuser

# Expose ports
EXPOSE 3000
EXPOSE 3001

# Run the application
CMD ["node", "dist/main.js"]
