FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

RUN bun run build

CMD ["bun", "migrateandstart"]