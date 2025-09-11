# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY patches/ ./patches
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma

# Copy other necessary files
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/credentials.json ./credentials.json

CMD ["sh", "-c", "pnpm migrateandstart"]