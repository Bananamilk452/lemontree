#!/bin/sh

pnpm prisma migrate dev

tail -f /dev/null