FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY patches/ ./patches
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run migrate
RUN pnpm run build

CMD ["pnpm", "start"]