#!/bin/sh

pnpm prisma migrate dev
pnpm prisma generate --sql

tail -f /dev/null