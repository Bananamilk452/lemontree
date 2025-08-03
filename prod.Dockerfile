# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY patches/ ./patches
RUN pnpm install --frozen-lockfile

COPY . .

# Generate Prisma client without connecting to DB
RUN pnpm prisma generate
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY patches/ ./patches

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy other necessary files
COPY --from=builder /app/assets ./assets

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]