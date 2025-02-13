FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

ENTRYPOINT [ "/app/docker-entrypoint.dev.sh" ]