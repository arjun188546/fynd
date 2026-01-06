# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci

# Build backend
FROM base AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Build frontend
FROM base AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Install nginx for serving frontend
RUN apk add --no-cache nginx

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script
COPY start.sh ./
RUN chmod +x start.sh

# Expose ports
EXPOSE 3001 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start services
CMD ["./start.sh"]
