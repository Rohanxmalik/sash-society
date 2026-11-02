# SASS Website: Technical Guide

How the South Asian Sociological Society website works, for anyone who maintains it. To put the site live, follow [GO-LIVE.md](GO-LIVE.md) instead.

## What the site does

- Public pages: about, committees, conferences, journal, events, contact.
- Member accounts: sign-up with an emailed code, profile, profile photo.
- Paid membership through Razorpay, with an emailed certificate and receipt.
- Paid conference registration through Razorpay, open to guests.
- An admin panel at `/admin` to see, export, approve, remove and import members, and to see event registrations and payments.

The site expects 30 to 50 sign-ups a month, so everything is chosen to be cheap and simple rather than to scale.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Pages, server actions and API routes in one app |
| UI | React 19, Tailwind 4, Framer Motion | Forms use react-hook-form with Zod |
| Database | Postgres 17 with Drizzle ORM | Neon Free in production, Docker locally, PGlite in tests |
| Auth | Better Auth | Password plus emailed codes, no social logins |
| Payments | Razorpay Orders API and Checkout | Plain `fetch`, no SDK |
| Email | Resend | 3,000 a month and 100 a day on the free plan |
| PDFs | pdf-lib | Made on demand, nothing stored on disk |
| Hosting | Railway Hobby | Runs `next start` as one long-lived Node process |
| Scheduled jobs | GitHub Actions | Daily job and nightly backup |

## Folder map

```
src/
  app/            Routes only. Pages stay thin and call backend functions.
    admin/        Admin panel. Every page calls requireAdmin().
    api/          auth, webhooks/razorpay, cron/daily, health,
                  documents/receipt, documents/certificate, admin/export
  backend/        Server-only code.
    admin/        Member operations, reports, CSV import, admin actions
    auth/         Better Auth setup, requireSession(), requireAdmin()
    contact/      Contact form
    db/           Drizzle schema, sequential numbers
    documents/    Certificate and receipt PDFs, and who may download them
    email/        Sender and templates
    jobs/         Daily job
    members/      Membership rules and queries
    payments/     Orders, confirmation, webhook, Razorpay and fake gateways
    profiles/     Profiles and the members list
    test/         Test database and harness
    runtime.ts    Wires the real mailer and gateway together
  frontend/       Browser code.
    components/   UI by feature
    content/      Static page content, navigation, legal text
    lib/          Razorpay Checkout loader, photo resizing, auth client
  shared/         Used by both sides. Validation, plans, events, money, config.
drizzle/          Generated SQL migrations
e2e/              Playwright browser tests
scripts/          migrate.mjs and check-setup.mjs
.github/workflows Daily job and nightly backup
```

ESLint enforces the split. `src/frontend` can only import `@/backend/**/actions`, and `src/shared` can import neither side. `src/app` can import anything.

## Database

Schema is in `src/backend/db/schema/`.

| Table | Holds |
|---|---|
| `user`, `session`, `account`, `verification`, `rate_limit` | Better Auth. `user.banned` is how a member is removed. |
| `profiles` | Name, phone, designation, education, experience, publications, photo, members list opt-out |
| `memberships` | Plan, status, member number, dates. A partial unique index allows one live membership per person. |
| `event_registrations` | One row per attempt. A partial unique index allows one confirmed registration per email per event. |
| `payments` | One row per Razorpay order, for either a membership or a registration |
| `counters` | Sequential numbers for members, receipts and registrations |

Membership status moves like this:

```
                     (plan needs approval)
paid ──────────────► pending_approval ──approve──► active ──end date──► expired
  │                        │                         │
  │ (no approval)          └──reject + refund──► rejected
  └────────────────────────────────────────────► active ──remove──► removed
```

Profile photos are kept in the database as small data URLs, at most 400 KB. The browser crops and shrinks them first. The disk on Railway is wiped on each deploy, so nothing may be stored there.

Migrations: change the schema, run `npm run db:generate`, commit the file in `drizzle/`. Railway applies it through `npm run db:deploy` before each deployment.

## How the main flows work

### Signing up

1. `/signup` collects name, phone, email, designation and password in the browser.
2. Better Auth emails a 6-digit code. Nothing is saved yet.
3. The person enters the code on the same screen. `signIn.emailOtp` creates the account and signs them in.
4. `completeSignupAction` sets the password and creates the profile.
5. They return to the page in `?next=`, which is `/membership` by default.

Normal password sign-up is turned off (`disableSignUp`). An account can only come from proving the inbox, so nobody can register someone else's address and keep a password on it. Someone signing up again with an existing email is just logged in, and their password and profile do not change.

### Joining

1. `/membership` lists plans from `src/shared/plans.ts`. A signed-out visitor goes to `/signup?next=/membership?plan=<slug>` and comes back with that plan marked.
2. `JoinDialog` takes the eligibility tick-box and, for organisations, the organisation name.
3. `startMembershipCheckoutAction` creates a Razorpay order for the price in `plans.ts`, and a `payments` row with status `created`. The browser never sends a price.
4. Razorpay Checkout opens. On success it returns a signed response.
5. `confirmPaymentAction` checks the signature against our stored order id, then calls `fulfilPayment`.
6. The browser plays the `Celebration` overlay and goes to the home page.

`fulfilPayment` is the only code that marks anything paid. In one transaction it claims the row with `UPDATE ... WHERE status = 'created'`, gives out a receipt number, and creates the membership or confirms the registration. Only one caller can win that update, so the browser and the webhook can both arrive safely. If a payment cannot be applied, such as a second payment from someone who is already a member, it stays recorded as paid with a note asking an admin to refund it.

The emails go out after the transaction commits. If one fails, `emailSentAt` stays empty and the daily job retries it.

### Plans that need approval

Life Abroad and Ordinary plans go to `pending_approval` after payment, with a receipt but no certificate or member number. In `/admin/members/<id>`:

- **Approve** gives the member number and dates and emails the certificate.
- **Reject and Refund** refunds through Razorpay and emails the person. If the refund call fails, the admin is told to refund from the Razorpay dashboard.

### Event registration

`/events/<id>/register` works for guests and prefills for logged-in members. The options and closing dates come from `src/shared/events.ts`, and the server re-checks the closing date. Fulfilment is the same as above, and the confirmation email carries a registration number such as `SASS/MU27/0001` and a receipt.

### Razorpay webhook

`POST /api/webhooks/razorpay` covers the case where a browser closes between paying and confirming. It verifies `X-Razorpay-Signature` over the raw body, then handles:

| Event | Action |
|---|---|
| `payment.authorized`, `payment.captured`, `order.paid` | Calls `fulfilPayment`, which captures the payment if needed |
| `refund.processed` | Marks the payment refunded, for refunds made in the dashboard |

A failed handler returns 500, so Razorpay retries it.

### Certificates and receipts

`src/backend/documents/` builds PDFs on demand with pdf-lib. Numbers are fixed when issued, so a document downloaded later matches the first one. Standard PDF fonts only cover Latin letters, so names are validated to Latin letters at sign-up. `/api/documents/*` only serves the owner or an admin, and answers 404 for anything else.

Signature images are read from `public/certificate/signature-1.png`, `signature-2.png` and `seal.png`. A missing file leaves a blank line for a wet signature.

### Daily job

A GitHub Action calls `POST /api/cron/daily` with `Authorization: Bearer $CRON_SECRET` at 06:00 India time. It marks lapsed memberships expired, sends renewal reminders 30 days before expiry, and retries unsent payment emails. A membership past its end date already shows as expired before this runs.

### Admin panel

Access comes from the `ADMIN_EMAILS` variable, and there are no admin roles in the database. To add an admin, the person signs up normally and you add their email to the variable.

- **Members**: search, filter, CSV export, and a detail page with every action.
- **Remove member**: bans the account, deletes their sessions, and marks the membership `removed`. They drop off the members list and cannot log in by any route. No refund is made. **Reinstate** reverses it.
- **Events**: registrations per event with CSV export.
- **Payments**: every paid or refunded payment, notes that need review, and a button to send a stuck email.
- **Import**: adds existing members from a CSV, using `public/member-import-template.csv`. Rows with problems are listed and skipped. Nobody is emailed, and imported members use "Forgot password" to get in.

CSV exports have a BOM so Excel reads Indian names correctly, and formula-like cells are neutralised.

## Where to change things

| To change | Edit |
|---|---|
| Plan prices, names, eligibility | `src/shared/plans.ts` |
| Event details, fees, closing dates | `src/shared/events.ts`, `src/shared/mauritius-2027.ts` |
| Add an event | Add it to `upcomingEvents` with a `registration` block. The form and admin page appear by themselves. |
| Certificate wording and signatories, email text, GST number, membership term, first member number | `src/shared/client-config.ts` |
| Certificate images | `public/certificate/` |
| Gallery photos | `public/images/conferences/1st-conference/` and `2nd-conference/`, then redeploy |
| Policies | `src/frontend/content/legal.ts`, and update `LEGAL_UPDATED_ON` |
| Who is an admin | `ADMIN_EMAILS` on Railway |

Past receipts keep their amount because the price is copied to the `payments` row at the time of payment.

## Environment variables

| Variable | Needed | Purpose |
|---|---|---|
| `DATABASE_URL` | Always | Postgres connection |
| `BETTER_AUTH_SECRET` | Always | Signs sessions. At least 32 characters. |
| `BETTER_AUTH_URL` | Always | Public site address. Must be https in production. |
| `ADMIN_EMAILS` | Production | Comma-separated admin emails |
| `RESEND_API_KEY`, `EMAIL_FROM` | Production | Email sending |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Production | Payments |
| `RAZORPAY_WEBHOOK_SECRET` | Production | Verifies webhooks |
| `CRON_SECRET` | Production | Protects the daily job |
| `DEV_MAIL_FILE` | Development | Where emails are written when Resend is off |

`src/instrumentation.ts` validates these at boot and stops the server if one is wrong, so a bad deploy fails health checks and the old version keeps running.

The fake payment gateway is used only when Razorpay keys are absent, and production refuses to start without them.

## Local development

```bash
npm install
cp .env.example .env.local   # set BETTER_AUTH_SECRET
npm run db:up                # Postgres in Docker on port 5433
npm run db:migrate
npm run dev
```

Without Razorpay keys, the Pay button succeeds at once through the fake gateway. Without Resend, emails appear in the server log and in `.dev-mail.jsonl`, and attachments in `.dev-mail/`.

## Tests

| Command | Covers |
|---|---|
| `npm test` | Unit and integration tests. Real migrations run on in-memory PGlite. |
| `npm run test:coverage` | The same, with an 80% coverage gate |
| `npm run test:e2e` | Playwright against the dev server and Docker Postgres. Needs `ADMIN_EMAILS=admin@example.org` in `.env.local`. |
| `npm run lint` | ESLint, including the backend and frontend boundaries |

## Security notes

- Every private page and action calls `requireSession()` or `requireAdmin()`. `src/proxy.ts` only sends cookie-less visitors to login and is not a security check.
- Prices come from the server, and payment signatures are checked against our stored order id, never one sent by the browser.
- `src/backend/safe-log.ts` removes query strings and private fields from logs.
- Rate limits: Better Auth keeps login and code limits in the database. Guest checkout and the contact form use in-memory limits, which reset on restart.
- Client IPs come from `X-Real-IP`, set by Railway's edge. This depends on traffic reaching Railway directly, so a DNS proxy such as Cloudflare's orange cloud must stay off.
- The headers are in `next.config.ts`. Not done yet: CAPTCHA, a full script CSP, and HSTS `includeSubDomains`.

## Running costs

| Item | Cost |
|---|---|
| Railway Hobby | $5 a month, including $5 of usage |
| Neon Free | Free: 1 GB, suspends after 5 idle minutes, first request after that takes about a second |
| Resend Free | Free up to 3,000 emails a month and 100 a day |
| GitHub Actions | Free within the plan's minutes |
| Domain | About $10 to $15 a year |
| Razorpay | 2% plus GST per domestic payment, up to 3% plus GST international. No setup fee. |
