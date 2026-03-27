# ───────── Stage 1: Build ─────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

RUN npm ci

# Install dependencies
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate

# Build the backend (NestJS)
RUN npm run build

# ───────── Stage 2: Production image ─────────
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN npm install --omit=dev

# Use non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "dist/src/main.js"]