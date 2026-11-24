# ==============================================================================
# backend/Dockerfile — Multi-Stage Production Build for Node.js API
# Stage 1: Build & Dependencies Isolation
# Stage 2: Minimalist Lightweight Alpine Production Runtime (< 90MB)
# ==============================================================================

# --- Stage 1: Dependencies Resolution ---
FROM node:22-alpine AS dependencies
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# --- Stage 2: Minimal Production Runtime ---
FROM node:22-alpine AS runner
WORKDIR /app

# Security: Install curl/wget for container healthcheck
RUN apk add --no-cache wget ca-certificates

# Copy production node_modules from Stage 1
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./

# Copy backend application source
COPY backend ./backend

# Create uploads directory and set permissions for non-root user
RUN mkdir -p backend/uploads/resumes && chown -R node:node /app

# Non-root user execution for enterprise container security
USER node

# Container Environment Variables
ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

# Docker Native Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start Application
CMD ["node", "backend/server.js"]
