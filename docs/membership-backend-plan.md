# Membership Backend Plan

Client request (24 Oct 2026): login and signup, member details stored per membership plan, and a certificate of acknowledgement emailed after payment.

## Stack

| Need | Choice |
|---|---|
| Backend | Next.js route handlers and server actions, same repo |
| Hosting, database, storage, cron | Railway (Postgres, Storage Bucket, cron service) |
| Database access | Drizzle |
| Login and signup | Better Auth, data in our own Postgres |
| Payments | Razorpay |
| Email | Resend |
| Certificates | `@react-pdf/renderer` |

Railway replaced Supabase to reduce the monthly cost. Without Supabase row-level security, every server action and private page must call `requireSession()` and scope queries to `session.user.id`.

## Phases

| # | Scope | Status |
|---|---|---|
| 1 | Better Auth, login, signup, email verification, password reset, profiles | Done, not deployed |
| 2 | `plans` table, per-plan forms, file uploads | Blocked on client |
| 3 | Razorpay order creation, checkout, webhook | Needs phase 2 and API keys |
| 4 | Certificate PDF and email | Blocked on client |
| 5 | Admin panel and member dashboard | Needs phases 2 to 4 |
| 6 | Renewal reminders, nightly `pg_dump` to the bucket, deployment | Needs domain |

## Before launch

Open items from the security review of phase 1. None block local development.

- **Check `X-Real-IP` on Railway.** After the first deploy, send rotating `X-Real-IP` values to `/api/auth/sign-in/email` and confirm the limit still triggers. If the client can set this header, the rate limit can be bypassed. Only testable on Railway.
- **Do this again if a CDN goes in front.** With Cloudflare or similar, `X-Real-IP` becomes the CDN's address and all visitors share one limit. Switch to the CDN's header and `trustedProxies`.
- **Add a CAPTCHA and per-address email cooldown.** Limits are per IP, so a botnet could send verification emails to thousands of addresses and damage the sending domain's reputation, which certificates depend on. Use Better Auth's `captcha` plugin (Turnstile is free) on sign-up, reset and resend. Needs a Cloudflare account.
- **Add a breached-password check.** Better Auth's `haveIBeenPwned` plugin. There is no per-account lockout yet, so a distributed attacker can keep guessing one account's password.
- **Validate `name` and `image` on the server.** Direct calls to `/api/auth/sign-up/email` and `/api/auth/update-user` skip the form's limits. Add `databaseHooks.user.create.before` and `update.before`. Certificates must print `profiles.full_name`, which is validated, and never `user.name`.
- **Set `trustedOrigins` if the site serves both apex and `www`.** Otherwise logins from the other host get 403. Better to redirect one to the other.
- **Add `includeSubDomains` to HSTS** once it is confirmed that every subdomain supports https.
- **Decide on a full `script-src` CSP.** Needs nonces, which makes every page dynamic. Left out for now.
- **Delete unverified users after 48 hours**, once the cron service exists (phase 6).

## Rules for later phases

- A membership activates only from the verified Razorpay webhook (`payment.captured`), never from the browser's success callback. Otherwise anyone can fake a payment and receive a certificate.
- The webhook must be idempotent. The same event arriving twice must not send two certificates.
- Keep `autoSignInAfterVerification` off. Whoever signs up chooses the password and may not own the address, so a click on the emailed link must never open a session. Otherwise an attacker can pre-register a member's email and read their payments and certificates later.
- Log errors with `safeLogValue`, never the raw object. Drizzle errors contain query values.
- Plans needing committee approval (Abroad, Ordinary) go to `pending_approval` after payment, and the certificate goes out after an admin approves. Confirm this order with the client first.

## Planned data model

```
plans         slug, name, price_minor, currency, duration_months|null,
              requires_approval, requires_document, max_delegates
memberships   user_id, plan_id, status, member_number, starts_at, expires_at,
              plan_details jsonb
payments      membership_id, razorpay_order_id, razorpay_payment_id, amount,
              currency, status
certificates  membership_id, cert_number, pdf_path, issued_at, emailed_at
delegates     membership_id, name, email
```

Membership `status`: `pending_payment`, `pending_approval`, `active`, `expired`, `rejected`.

## Needed from the client

- Fields and documents required for each plan
- Whether Abroad and Ordinary members pay before or after approval
- Certificate wording, logo, signatures, seal, member number format
- A domain they own (`sass-socio.org` is gone, and Resend cannot send from Gmail)
- Refund, terms and privacy pages, which Razorpay requires
- GST and 80G details, if any
- Existing member list
- 40 gallery photos
