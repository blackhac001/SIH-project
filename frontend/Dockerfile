# Multi-stage build: builder and production stages
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build optimized production bundle
RUN npm run build


# Production stage: lightweight web server
FROM node:20-alpine

WORKDIR /app

# Install lightweight HTTP server for serving static assets
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security (node is uid 1000, so use 1001)
RUN adduser -D -u 1001 -G node appuser
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Serve production build
CMD ["serve", "-s", "dist", "-l", "3000"]
