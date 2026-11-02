# Client Meeting Checklist

Everything to get from SASS so the site can go live. Ask in this order: the first section decides whether launch can happen tomorrow.

## Must have before launch

### 1. Razorpay

- [ ] Before the meeting, log in with the Razorpay login you already have and check whether the account is **activated**, meaning live mode works. Live keys only appear once it is.
- [ ] If it is activated: you have what you need. Confirm the bank account that receives payouts is the society's.
- [ ] If it is not: finish activation tonight. It usually takes a few working days, and until then the site cannot take real money. Have these ready:
  - Registration certificate of the society
  - PAN of the society
  - Bank account in the society's name, with a cancelled cheque or bank letter
  - ID proof of the authorised signatory
  - Website address, which needs the policy pages to be live
- [ ] Is the Mauritius registration urgent enough to keep the old Google Form until activation? Offline closes on 25 Nov.
- [ ] Do they want international cards? The $116 and $300 plans need Razorpay to enable this, which is a separate request.

### 2. Domain

- [ ] `sass-socio.org` is printed on the brochure and QR code, but it was **not registered** when checked on 2 Nov 2026. Does anyone hold it? If not, buy it tonight, because anyone else could.
- [ ] Which email should own it? It should be theirs, not ours.

### 3. Who manages the site

- [ ] Which email addresses get admin access?
- [ ] Which inbox should receive contact form messages? It is `southasiansociety2@gmail.com` now.

### 4. Who pays the running costs

- [ ] Card for Railway, $5 a month.
- [ ] Domain, about $10 to $15 a year.
- [ ] Razorpay takes 2% plus GST on each payment, so ₹10,000 reaches them as about ₹9,764.

## Decisions to confirm

### 5. Prices

Confirm each one is right today:

| Plan | Price | Length | Needs approval |
|---|---|---|---|
| Life (India) | ₹10,000 | Lifetime | No |
| Life (South Asia) | $116 | Lifetime | No |
| Life (Abroad) | $300 | Lifetime | Yes |
| Individual | ₹3,000 | 4 years | No |
| Ordinary | ₹1,000 | 1 year | Yes |
| Student | ₹500 | 1 year | No |
| Institutional | ₹10,000 | Lifetime | No |
| Social Science Societies | ₹1,000 | 1 year | No |

| Mauritius 2027 | Fee | Closes |
|---|---|---|
| Offline | ₹5,000 | 25 Nov 2026 |
| Online | ₹2,000 | 20 Jan 2027 |

- [ ] Do foreign delegates pay the same rupee fee for Mauritius?
- [ ] Should members get a discount on conference fees?
- [ ] The Individual plan says "Also available at US $35", but the site only sells it at ₹3,000. Do they want a US $35 option, or should that line go?
- [ ] Institutional and Societies plans say "Up to 3 delegates". The site records the organisation name only, and delegates are not named or given their own access. Is that fine for now?

### 6. Membership rules

- [ ] Does a plan run **from the joining date**, or by **calendar year**? It is set to the joining date, but the Individual plan text says "Jan 1 - Dec 31", which suggests calendar year.
- [ ] What is the last member number already issued? Numbering carries on from there.
- [ ] Who approves Life Abroad and Ordinary applications, and how quickly?
- [ ] Imported members appear on the public members list straight away, with name and designation. They can only opt out after logging in. Is that acceptable, or should imported members start hidden?

### 7. Refund policy

The drafts say:

- Membership fees are not refundable once active. Rejected applications get a full refund.
- Conference fees are not refundable, unless the society cancels the event.
- Duplicate payments are refunded.

- [ ] Do they agree? Do they want a refund window, such as a part refund up to 30 days before the conference?
- [ ] Are they happy with Aurangabad courts in the Terms?

Have someone at SASS read the four policy pages. They were drafted by us and have not had legal review.

### 8. Tax

- [ ] Is SASS GST registered? If yes, get the GSTIN. Receipts then print as invoices.

## Content to collect

- [ ] Signatures of the President and Secretary on white paper, photographed clearly, or as transparent PNGs. Names are set to Prof. Shaikh Moh. Kais and Prof. B. B. Malik. Confirm these.
- [ ] The society's seal, if the certificate should carry one.
- [ ] Wording of the certificate. It reads: "Certificate of Membership ... has been admitted as a member of the South Asian Sociological Society ... in the category of ...".
- [ ] What the welcome email should say about what to expect. Draft text is in `src/shared/client-config.ts`.
- [ ] Spreadsheet of **existing members**: name, email, phone, designation, institution, plan, member number, date joined, expiry date.
- [ ] List of anyone **already registered for Mauritius** through the Google Form or by bank transfer. They are not in the new system. Decide whether to add them by hand or keep that list alongside.
- [ ] Conference photos for the gallery. The old photo links point to the unregistered domain, so the gallery shows "coming soon" until we have them.

## Things to tell them

- [ ] **Brochure IFSC is wrong.** It prints `UTIB000177`, one digit short. Public listings show `UTIB0001773`. Please check with the bank. Bank details are not on the website.
- [ ] **Two Singapore themes.** The site shows two different themes for the 2026 Singapore conference. Which is correct?
- [ ] **Admin training.** Removing a member does not refund them. Refunds for anything except a rejected application are done in Razorpay.
- [ ] **No uploads for ID proof.** Life India and Student applicants tick a declaration at launch and upload nothing. The society can ask for proof by email.
