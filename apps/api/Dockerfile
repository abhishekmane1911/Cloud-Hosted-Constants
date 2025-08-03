# Multi-stage build for Node.js API
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S constants -u 1001

# Copy built application and node_modules
COPY --from=builder --chown=constants:nodejs /app/dist ./dist
COPY --from=builder --chown=constants:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=constants:nodejs /app/package*.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Switch to non-root user
USER constants

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]