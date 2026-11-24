# ==============================================================================
# frontend/Dockerfile — Multi-Stage Production Build for React Vite SPA
# Stage 1: Build & Compile React SPA
# Stage 2: Ultra-lightweight Nginx Alpine Static Server (< 25MB)
# ==============================================================================

# --- Stage 1: Build React Assets ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifests first to leverage layer cache
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source code and build production bundle
COPY frontend ./
RUN npm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:1.27-alpine AS runner

# Remove default nginx boilerplate website
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled production artifacts from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (SPA routing + /api/ proxy)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Native Docker Health Check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
