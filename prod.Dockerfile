FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install

RUN bun build

# Prisma init
RUN bun prisma migrate deploy
RUN bun prisma generate

CMD ["bun", "start"]