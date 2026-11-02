# South Asian Sociological Society website

Public site and member accounts for SASS, built with Next.js 16. Backend plan and status: [docs/membership-backend-plan.md](docs/membership-backend-plan.md).

## Setup

Needs Node 20 or later and Docker.

```bash
npm install
cp .env.example .env.local   # then set BETTER_AUTH_SECRET
npm run db:up                # starts Postgres on port 5433
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.

Without a Resend key, emails are not sent. Verification and reset links appear in the dev server log and in `.dev-mail.jsonl`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit and integration tests, using in-memory Postgres |
| `npm run test:coverage` | Tests with an 80% coverage gate |
| `npm run test:e2e` | Browser tests. Needs Postgres running and Chrome installed |
| `npm run db:up` | Start local Postgres |
| `npm run db:generate` | Create a migration after a schema change |
| `npm run db:migrate` | Apply migrations |

## How auth is put together

- `src/lib/auth/create-auth.ts` holds the Better Auth rules: email verification, rate limits, password reset.
- `src/lib/session.ts` has `requireSession()`. Every private page and server action must call it, because the database has no row-level security.
- `src/proxy.ts` only redirects visitors with no session cookie. It does not prove the cookie is valid.
- `src/db/schema/auth.ts` is generated. After changing auth plugins, rerun `npx auth@latest generate`, then `npm run db:generate`.
- Public pages stay static, so the header reads the session in the browser (`AuthNavLink`). Don't read the session in the root layout.

## Production

The server refuses to start unless these are set: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (must be https), `RESEND_API_KEY`, `EMAIL_FROM`. Run `npm run db:migrate` before each deploy that includes a new migration.

Security items still open before launch are listed in the [plan](docs/membership-backend-plan.md#before-launch).

Rate limiting reads the client address from `X-Real-IP`, which Railway's edge sets. Hosting elsewhere needs a change to `advanced.ipAddress` in `create-auth.ts`.
