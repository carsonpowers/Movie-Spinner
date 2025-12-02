# Multi-stage Dockerfile optimized for Bun and Next.js
# Production-ready with minimal image size

# Stage 1: Dependencies
FROM oven/bun:1.1.34-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* bunfig.toml ./

# Install dependencies (including dev dependencies)
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM oven/bun:1.1.34-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy environment file
COPY .env.local ./

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN bun run build

# Stage 3: Runner (Production)
FROM oven/bun:1.1.34-alpine AS runner
WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun fetch http://localhost:3000/api/health || exit 1

# Start the application
CMD ["bun", "run", "server.js"]
