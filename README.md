# South Asian Sociological Society website

Public site, paid memberships, conference registration and admin panel for SASS, built with Next.js 16.

- [docs/TECHNICAL.md](docs/TECHNICAL.md): how everything works and where to change things
- [docs/GO-LIVE.md](docs/GO-LIVE.md): step-by-step launch runbook
- [docs/CLIENT-MEETING.md](docs/CLIENT-MEETING.md): what is needed from the client

## Setup

Needs Node 24 and Docker.

```bash
npm install
cp .env.example .env.local   # then set BETTER_AUTH_SECRET
npm run db:up                # starts Postgres on port 5433
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.

Without Razorpay keys, the Pay button succeeds through a fake gateway. Without a Resend key, emails appear in the server log and in `.dev-mail.jsonl`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint, including the frontend and backend boundaries |
| `npm test` | Unit and integration tests, using in-memory Postgres |
| `npm run test:coverage` | Tests with an 80% coverage gate |
| `npm run test:e2e` | Browser tests. Needs Postgres running and Chrome installed |
| `npm run db:up` | Start local Postgres |
| `npm run db:generate` | Create a migration after a schema change |
| `npm run db:migrate` | Apply migrations locally |
| `npm run db:deploy` | Apply migrations in production, run by Railway before each deploy |
| `npm run setup:check` | Check the production setup. See GO-LIVE step 12 |
