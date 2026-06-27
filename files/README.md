# DayZeroFoundry API (backend)

This backend is created in `files/` to match the existing root scripts and platform config.

## Quick start (local)
1. Install deps:
   ```bash
   cd files && npm install
   ```

2. Copy env:
   ```bash
   cp .env.example .env
   ```

3. Configure `DATABASE_URL` to point to a running Postgres.

4. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:dev
   ```

5. Start dev server:
   ```bash
   npm run dev
   ```

API base: `http://127.0.0.1:4000/api/v1/...`

Health check: `GET /healthz`

