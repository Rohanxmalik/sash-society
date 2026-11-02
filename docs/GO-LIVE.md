# Go-Live Runbook

Every step to put the site live, in order. Allow about 2 hours once you have what is in [CLIENT-MEETING.md](CLIENT-MEETING.md). DNS can add up to a few hours, so start with step 1.

Tick the steps as you go. Keep the secrets in a password manager, never in a file in this repo.

## Before you start

You need these accounts: GitHub (repo `Rohanxmalik/sash-society`), Render, Neon, Resend, cron-job.org, GoDaddy (the domain), and the client's Razorpay.

**Razorpay is the one step that can block launch.** Live keys only exist once the client's account has passed KYC. If that has not happened, do everything below with test keys so the site is ready, but do not announce it. In test mode real cards are refused, so nobody can pay. Swap in live keys in step 5 the moment activation comes through.

## 1. The domain

`sass-socio.org` was bought on GoDaddy on 2 Nov 2026.

- [ ] Keep DNS at GoDaddy. Do not add your own proxy in front of the site, such as a Cloudflare orange cloud. Render already has its own edge, and a second proxy changes the visitor IP that rate limits rely on.

## 2. The code

Render and the scheduled GitHub Actions both use `main`, so anything going live must be merged there.

## 3. Create the database on Neon

- [ ] New project, name `sass`, Postgres 18, region **AWS Asia Pacific (Singapore)**. A later major version also needs the client version raised in `.github/workflows/nightly-backup.yml`.
- [ ] Copy the connection string with **Connection pooling turned off**. This is `DATABASE_URL`. The app keeps its own small pool, and migrations and backups need a direct connection.

## 4. Set up email on Resend

- [ ] Add the domain `sass-socio.org`, region Tokyo or the closest offered.
- [ ] Add the DNS records it shows you at the registrar, then press Verify.
- [ ] Create an API key with **Sending access** only. This is `RESEND_API_KEY`.
- [ ] Set `EMAIL_FROM` to `SASS <no-reply@sass-socio.org>`.

The contact form sends to `southasiansociety2@gmail.com`, with Reply-To set to the visitor.

## 5. Get the Razorpay keys

In the client's Razorpay Dashboard:

- [ ] **Account & Settings → API Keys**: generate keys. These are `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. The secret is shown once.
- [ ] **Account & Settings → Payment capture**: set to automatic.
- [ ] **International payments**: ask Razorpay to enable them. The $116 and $300 plans fail with "We could not start the payment" until this is on. Everything in rupees works without it.

## 6. Generate the backup passphrase

Render generates the other secrets in the next step. Run this once and keep the result as `BACKUP_PASSPHRASE`:

```bash
openssl rand -base64 32
```

## 7. Deploy on Render

- [ ] Use a workspace with no other Free web service that stays awake. Free services share 750 hours a month, and this site uses up to 744. If the hours run out, every Free service stops until the next month.
- [ ] **New → Blueprint**, connect GitHub, pick `sash-society`, branch `main`. Render reads `render.yaml`, which sets the Free plan, Singapore, the commands and the health check path. The region cannot be changed later.
- [ ] Fill in the values Render asks for:

| Variable | Value |
|---|---|
| `DATABASE_URL` | From step 3 |
| `ADMIN_EMAILS` | From the client, comma separated |
| `RESEND_API_KEY` | From step 4 |
| `RAZORPAY_KEY_ID` | From step 5 |
| `RAZORPAY_KEY_SECRET` | From step 5 |

`render.yaml` fixes `BETTER_AUTH_URL` and `EMAIL_FROM`, and Render generates `BETTER_AUTH_SECRET`, `CRON_SECRET` and `RAZORPAY_WEBHOOK_SECRET`. Copy the last two from the **Environment** tab when later steps need them.

- [ ] Wait for the deploy to go live. If it fails, read the logs. A missing variable is named there. Migrations run at the end of the build, so a wrong `DATABASE_URL` fails the build and nothing goes live.

## 8. Point the domain at Render

- [ ] Service **Settings → Custom Domains → Add**: enter `sass-socio.org`. Render adds `www` and redirects it to the bare domain.
- [ ] In GoDaddy's DNS page, delete the parking `A` records (`15.197.148.33`, `3.33.130.190`), the existing `www` `CNAME`, any `AAAA` records and any domain forwarding. Leave the Resend records alone.
- [ ] Add the `A` record for `@` and the `CNAME` for `www` that Render shows.
- [ ] Press **Verify** in Render and wait for the https certificate.
- [ ] Open `https://www.sass-socio.org`. It must redirect to `https://sass-socio.org`.

Log in only after this step. Sign-in is tied to `BETTER_AUTH_URL`, so it does not work on the `onrender.com` address.

## 9. Add the Razorpay webhook

- [ ] **Account & Settings → Webhooks → Add**:
  - URL: `https://sass-socio.org/api/webhooks/razorpay`
  - Secret: `RAZORPAY_WEBHOOK_SECRET` from Render
  - Events: `payment.authorized`, `payment.captured`, `order.paid`, `refund.processed`

Webhooks are set separately for test and live mode, so repeat this when moving to live keys.

## 10. Keep the site awake

Render's Free plan sleeps after 15 minutes without a request, and the next visitor then waits about a minute.

- [ ] Create a free account on [cron-job.org](https://cron-job.org).
- [ ] **Create cronjob**: URL `https://sass-socio.org/api/ping`, every 10 minutes, with failure notifications on.
- [ ] Check its history shows `200` after 20 minutes.

Never point this at `/api/health`. That runs a database query, which would keep Neon awake and use up its free compute.

## 11. Turn on the scheduled jobs

Repository **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `SITE_URL` | `https://sass-socio.org` |
| `CRON_SECRET` | Same as on Render |
| `BACKUP_DATABASE_URL` | Same as `DATABASE_URL` |
| `BACKUP_PASSPHRASE` | From step 6 |

- [ ] **Actions** tab → run **Daily job** and **Nightly backup** by hand once. Both must go green.

Keep `BACKUP_PASSPHRASE` somewhere safe. The backups cannot be opened without it.

## 12. Add the client's content

All of it goes in one commit, then merge to `main` and Render redeploys.

- [ ] `src/shared/client-config.ts`: signatories, certificate wording, GST number, membership term, `firstMemberNumber`, email text.
- [ ] `public/certificate/`: `signature-1.png`, `signature-2.png` (transparent PNG), `seal.png`.
- [ ] `src/shared/plans.ts`: any price changes.
- [ ] `src/frontend/content/legal.ts`: approved policy text.
- [ ] `public/images/conferences/`: gallery photos.

## 13. Create the admin accounts

- [ ] Each admin signs up on the site with the exact email in `ADMIN_EMAILS`.
- [ ] They open `/admin`. If it sends them to the home page, the email does not match the variable.
- [ ] **Import**: upload the existing members CSV, starting from the template on that page. Fix any rows it lists and upload those again.

## 14. Check everything

- [ ] Run the setup check. Paste the values from Render's **Environment** tab into a file named `.env.render`, then run this. All lines must say PASS. Delete the file afterwards.

```bash
node --env-file=.env.render scripts/check-setup.mjs
```

- [ ] Sign up with a real email of yours. The code must arrive within a minute, in the inbox and not spam.
- [ ] Buy the **Student** plan for ₹500 with a real payment. Check the animation, the certificate and receipt in your email and on the profile page, and the look of the certificate.
- [ ] Register for the online conference option for ₹2,000 as a guest in a private window. Check the animation and email.
- [ ] In `/admin`: find both, download each CSV and open it in Excel, then check the Razorpay Dashboard shows the webhook as delivered.
- [ ] Refund both from the Razorpay Dashboard. Within a few minutes the payments page shows `refunded`. Remove the test member in `/admin`.
- [ ] **Check the rate limit uses the real IP.** Enter a wrong password 6 times from your phone on mobile data. The sixth must say "Too many attempts", and your laptop on another network must still be able to log in.
- [ ] Visit `/admin` and `/api/admin/export/members` in a private window. Both must send you to login.

## 15. Announce

- [ ] Replace the Google Form link wherever it was shared with `https://sass-socio.org/events/mauritius-2027/register`.
- [ ] Have the brochure's QR code point there.

Offline registration closes automatically on 25 Nov 2026 at 23:59 India time, and online on 20 Jan 2027.

## If something goes wrong

| Problem | Do this |
|---|---|
| Bad deploy | Render → Events → Rollback on the last good deploy |
| Site takes a minute to open | It went to sleep. Check the job history on cron-job.org |
| Every page is down and Render says suspended | The 750 Free hours ran out. Stop any other Free service in the workspace, or move to a paid plan |
| No sign-up code arrives | Resend → Logs. Check the domain is verified and `EMAIL_FROM` uses it |
| Money taken but no membership | Check the webhook in Razorpay. Then `/admin/payments` for a note. Razorpay retries failed webhooks for 24 hours |
| Member says no certificate came | `/admin/members/<id>` → Resend Welcome Email |
| Payment shows a note in admin | Usually a duplicate payment. Read the note, then refund it in Razorpay |
| Site is slow on the first visit of the day | Normal. Neon wakes up in about a second |

### Restoring a backup

Neon can restore to any point in the last 6 hours from its dashboard, which is the first thing to try. For anything older:

1. GitHub → Actions → Nightly backup → pick a run → download the artifact.
2. Decrypt it:

```bash
gpg --decrypt sass-backup.dump.gpg > sass-backup.dump
```

3. Restore into a **new** Neon database, check it, then point `DATABASE_URL` at it:

```bash
pg_restore --no-owner --dbname "$NEW_DATABASE_URL" sass-backup.dump
```
