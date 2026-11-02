# Go-Live Runbook

Every step to put the site live, in order. Allow about 2 hours once you have what is in [CLIENT-MEETING.md](CLIENT-MEETING.md). DNS can add up to a few hours, so start with step 1.

Tick the steps as you go. Keep the secrets in a password manager, never in a file in this repo.

## Before you start

You need these accounts: GitHub (repo `Rohanxmalik/sash-society`), Railway, Neon, Resend, the domain registrar, and the client's Razorpay.

**Razorpay is the one step that can block launch.** Live keys only exist once the client's account has passed KYC. If that has not happened, do everything below with test keys so the site is ready, but do not announce it. In test mode real cards are refused, so nobody can pay. Swap in live keys in step 5 the moment activation comes through.

## 1. Buy the domain

- [ ] Search for `sass-socio.org` at the registrar. On 2 Nov 2026 it was unregistered, even though the brochure and QR code point to it. Confirm with the client that they do not hold it under another name.
- [ ] Buy it with an email the client controls.
- [ ] Do not change the nameservers unless you want to. If you use Cloudflare DNS, every record must be **DNS only (grey cloud)**, because a proxy breaks the visitor IP that rate limits rely on.

## 2. Put the code on GitHub

- [ ] `git push -u origin feat/membership-portal`
- [ ] Open a pull request into `main` and merge it. Scheduled GitHub Actions only run from `main`.

## 3. Create the database on Neon

- [ ] New project, name `sass`, Postgres 17, region **AWS Asia Pacific (Singapore)**.
- [ ] Copy the connection string with **Connection pooling turned off**. This is `DATABASE_URL`. The app keeps its own small pool, and migrations and backups need a direct connection.

## 4. Set up email on Resend

- [ ] Add the domain `sass-socio.org`, region Tokyo or the closest offered.
- [ ] Add the DNS records it shows you at the registrar, then press Verify.
- [ ] Create an API key with **Sending access** only. This is `RESEND_API_KEY`.
- [ ] Set `EMAIL_FROM` to `SASS <no-reply@sass-socio.org>`.

The contact form sends to `southasiansociety2@gmail.com`, with Reply-To set to the visitor.

## 5. Set up Razorpay

In the client's Razorpay Dashboard:

- [ ] **Account & Settings → API Keys**: generate keys. These are `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. The secret is shown once.
- [ ] **Account & Settings → Webhooks → Add**:
  - URL: `https://sass-socio.org/api/webhooks/razorpay`
  - Secret: generate one (step 6). This is `RAZORPAY_WEBHOOK_SECRET`.
  - Events: `payment.authorized`, `payment.captured`, `order.paid`, `refund.processed`
- [ ] **Account & Settings → Payment capture**: set to automatic.
- [ ] **International payments**: ask Razorpay to enable them. The $116 and $300 plans fail with "We could not start the payment" until this is on. Everything in rupees works without it.

Webhooks are set separately for test and live mode, so repeat this when moving to live keys.

## 6. Generate the secrets

Run this four times and label each result:

```bash
openssl rand -base64 32
```

`BETTER_AUTH_SECRET`, `CRON_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `BACKUP_PASSPHRASE`

## 7. Deploy on Railway

- [ ] Choose the **Hobby** plan. The Free plan has no custom domains.
- [ ] New Project → Deploy from GitHub repo → `sash-society`, branch `main`.
- [ ] Service **Settings**:
  - Region: Southeast Asia (Singapore)
  - Start Command: `npm start`
  - Pre-Deploy Command: `npm run db:deploy`
  - Healthcheck Path: `/api/health`
- [ ] Service **Variables**: add these. Leave `NODE_ENV` unset, Railway handles it.

| Variable | Value |
|---|---|
| `DATABASE_URL` | From step 3 |
| `BETTER_AUTH_SECRET` | From step 6 |
| `BETTER_AUTH_URL` | `https://sass-socio.org` with no trailing slash |
| `ADMIN_EMAILS` | From the client, comma separated |
| `RESEND_API_KEY` | From step 4 |
| `EMAIL_FROM` | `SASS <no-reply@sass-socio.org>` |
| `RAZORPAY_KEY_ID` | From step 5 |
| `RAZORPAY_KEY_SECRET` | From step 5 |
| `RAZORPAY_WEBHOOK_SECRET` | From step 6 |
| `CRON_SECRET` | From step 6 |

- [ ] Wait for the deploy to go green. If it fails, read the Deploy Logs. A missing variable is named there.

Railway's Config as Code file cannot be used on new services, so these settings live in the dashboard and not in the repo.

## 8. Point the domain at Railway

- [ ] Service **Settings → Networking → Custom Domain**: add `sass-socio.org` and `www.sass-socio.org`.
- [ ] Add the records Railway shows at the registrar. The bare domain needs a provider that supports CNAME flattening or ALIAS records, such as Cloudflare DNS. If your registrar does not, move DNS to Cloudflare, grey cloud.
- [ ] Wait for the green tick and the https certificate.
- [ ] Open `https://www.sass-socio.org`. It must redirect to `https://sass-socio.org`.

## 9. Turn on the scheduled jobs

Repository **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `SITE_URL` | `https://sass-socio.org` |
| `CRON_SECRET` | Same as on Railway |
| `BACKUP_DATABASE_URL` | Same as `DATABASE_URL` |
| `BACKUP_PASSPHRASE` | From step 6 |

- [ ] **Actions** tab → run **Daily job** and **Nightly backup** by hand once. Both must go green.

Keep `BACKUP_PASSPHRASE` somewhere safe. The backups cannot be opened without it.

## 10. Add the client's content

All of it goes in one commit, then merge to `main` and Railway redeploys.

- [ ] `src/shared/client-config.ts`: signatories, certificate wording, GST number, membership term, `firstMemberNumber`, email text.
- [ ] `public/certificate/`: `signature-1.png`, `signature-2.png` (transparent PNG), `seal.png`.
- [ ] `src/shared/plans.ts`: any price changes.
- [ ] `src/frontend/content/legal.ts`: approved policy text.
- [ ] `public/images/conferences/`: gallery photos.

## 11. Create the admin accounts

- [ ] Each admin signs up on the site with the exact email in `ADMIN_EMAILS`.
- [ ] They open `/admin`. If it sends them to the home page, the email does not match the variable.
- [ ] **Import**: upload the existing members CSV, starting from the template on that page. Fix any rows it lists and upload those again.

## 12. Check everything

- [ ] Run the setup check. All lines must say PASS:

```bash
npm i -g @railway/cli
railway login
railway link
railway run npm run setup:check
```

- [ ] Sign up with a real email of yours. The code must arrive within a minute, in the inbox and not spam.
- [ ] Buy the **Student** plan for ₹500 with a real payment. Check the animation, the certificate and receipt in your email and on the profile page, and the look of the certificate.
- [ ] Register for the online conference option for ₹2,000 as a guest in a private window. Check the animation and email.
- [ ] In `/admin`: find both, download each CSV and open it in Excel, then check the Razorpay Dashboard shows the webhook as delivered.
- [ ] Refund both from the Razorpay Dashboard. Within a few minutes the payments page shows `refunded`. Remove the test member in `/admin`.
- [ ] **Check the rate limit uses the real IP.** Enter a wrong password 6 times from your phone on mobile data. The sixth must say "Too many attempts", and your laptop on another network must still be able to log in.
- [ ] Visit `/admin` and `/api/admin/export/members` in a private window. Both must send you to login.

## 13. Announce

- [ ] Replace the Google Form link wherever it was shared with `https://sass-socio.org/events/mauritius-2027/register`.
- [ ] Have the brochure's QR code point there.

Offline registration closes automatically on 25 Nov 2026 at 23:59 India time, and online on 20 Jan 2027.

## If something goes wrong

| Problem | Do this |
|---|---|
| Bad deploy | Railway → Deployments → Redeploy the last good one |
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
