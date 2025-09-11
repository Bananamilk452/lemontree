FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

ENTRYPOINT [ "/app/docker-entrypoint.dev.sh" ]