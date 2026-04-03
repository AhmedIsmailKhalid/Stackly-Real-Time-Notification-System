# ─────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client for production
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Cloud Run expects PORT env var — default 8080
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]