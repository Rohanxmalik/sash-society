import { siteConfig } from "./site-config";

// Everything the client signs off lives in this file, so go-live needs no other
// code changes. See docs/GO-LIVE.md. Prices are in plans.ts and events.ts, and
// signature, seal and logo images go in public/certificate/.
export const clientConfig = {
  society: {
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    address: siteConfig.address,
    phone: siteConfig.phone,
    email: siteConfig.emails[0],
    // Leave null unless GST-registered. Decides "Payment Receipt" or "Invoice".
    gstin: null as string | null,
  },

  membership: {
    // "from-joining": a 1-year plan bought on 5 March ends 4 March next year.
    // "calendar-year": every plan ends on 31 December.
    term: "from-joining" as "from-joining" | "calendar-year",
    // Set above the last number already issued, so numbering continues.
    firstMemberNumber: 1,
    reminderDaysBeforeExpiry: 30,
  },

  certificate: {
    title: "Certificate of Membership",
    statement: "has been admitted as a member of the",
    categoryPrefix: "in the category of",
    // signatureFile is a transparent PNG in public/certificate/. If the file is
    // missing, the certificate prints a blank line for a wet signature.
    signatories: [
      {
        name: "Prof. Shaikh Moh. Kais",
        designation: "President",
        signatureFile: "signature-1.png",
      },
      {
        name: "Prof. B. B. Malik",
        designation: "Secretary",
        signatureFile: "signature-2.png",
      },
    ],
  },

  emails: {
    memberWhatToExpect: [
      "Your membership certificate and payment receipt are attached to this email.",
      "You can download them again at any time from your profile page.",
      "You will receive updates about SASS conferences, workshops and publications.",
      "Please keep your profile up to date, including your designation and publications.",
    ],
    approvalWhatToExpect: [
      "Your payment has been received and your receipt is attached.",
      "The committee will review your application.",
      "Once approved, we will email your membership certificate.",
      "If it is not approved, your payment will be refunded.",
    ],
    eventWhatToExpect: [
      "Your payment receipt is attached to this email.",
      "Submit your abstract and full paper by email, attaching this receipt, before the dates below.",
      "We will contact you with the programme and joining details closer to the event.",
    ],
  },
};

export type Signatory = (typeof clientConfig.certificate.signatories)[number];
