# Single-purpose image for running the app locally with `docker compose up`.
# Kept deliberately simple (no multi-stage slimming): the brief asks for
# "runnable with minimal setup", not a production image.

FROM node:22-slim

# Prisma's CLI needs OpenSSL for the migration engine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first so this layer is cached across code changes.
# postinstall runs `prisma generate`, which needs the schema and config.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY . .

# DATABASE_URL is only needed at runtime; give the build a placeholder so
# `prisma generate` / `next build` do not complain.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Apply migrations, load demo data if the database is empty, then serve.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start"]
