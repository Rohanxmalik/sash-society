import { siteConfig } from "@/shared/site-config";

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalDocument = {
  title: string;
  description: string;
  sections: LegalSection[];
};

const { name, email, address, phone } = siteConfig;
const CONTACT_LINE = `${name}, ${address}. Email: ${email}. Phone: ${phone}.`;

export const LEGAL_UPDATED_ON = "3 November 2026";

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  description: "How SASS collects, uses and protects your personal information.",
  sections: [
    {
      heading: "Who We Are",
      paragraphs: [
        `This website is run by the ${name} (SASS). This policy explains what personal information we collect, why we collect it and what choices you have.`,
      ],
    },
    {
      heading: "What We Collect",
      paragraphs: [
        "When you create an account, we collect your name, email address, phone number, designation and password.",
        "When you join as a member or register for an event, we also collect your affiliation and, where you give them, your paper title and sub-theme. For organisation plans we collect the organisation's name.",
        "You may choose to add your institution, country, education, experience, publications, website and a profile photo.",
        "When you submit work to the journal, we keep your file along with its title, authors and abstract.",
        "Payments are handled by Razorpay. We receive a payment reference and the amount paid. We never see or store your card, UPI or bank details.",
        "When you use the contact form, we receive the details you enter there. We also keep basic technical records, such as IP addresses, to protect the site from abuse.",
      ],
    },
    {
      heading: "How We Use It",
      paragraphs: [
        "We use your information to run your membership and event registrations, issue receipts and certificates, send you emails about your membership, renewals and events, reply to your questions, keep the site secure, and meet our accounting and legal duties.",
      ],
    },
    {
      heading: "The Public Members List",
      paragraphs: [
        "If you are an active member, your name and designation appear in the public members list on this website. You can turn this off at any time on your profile page. Your email, phone number and other details are never shown there.",
      ],
    },
    {
      heading: "Who We Share It With",
      paragraphs: [
        "We share information only with the services that help us run this website: Razorpay for payments, Resend for sending email, and our hosting and database providers. Some of these services store information outside India. We may also share information where the law requires it.",
        "We do not sell your information, and we do not share it for advertising.",
      ],
    },
    {
      heading: "Cookies",
      paragraphs: [
        "We use only the cookies needed to keep you logged in. We do not use advertising or tracking cookies.",
      ],
    },
    {
      heading: "How Long We Keep It",
      paragraphs: [
        "We keep your information for as long as you have an account with us. Payment and membership records may be kept for longer where we need them for our accounts or the law.",
      ],
    },
    {
      heading: "Keeping It Safe",
      paragraphs: [
        "Your information is sent over an encrypted connection, and your password is stored only in a scrambled form that we cannot read. No website can promise complete security, but we take care to protect what you give us.",
      ],
    },
    {
      heading: "Your Rights",
      paragraphs: [
        "You can see and change most of your details on your profile page. You can also ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete your account. We may need to keep payment records even after an account is deleted.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "This website is meant for people aged 18 or over. If you are under 18, please ask a parent or guardian to contact us before you sign up.",
      ],
    },
    {
      heading: "Changes to This Policy",
      paragraphs: [
        "We may update this policy from time to time. The date at the bottom of this page shows when it last changed.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "For questions or complaints about your information, please write to us.",
        CONTACT_LINE,
      ],
    },
  ],
};

export const termsAndConditions: LegalDocument = {
  title: "Terms & Conditions",
  description: "The terms for using this website, joining SASS and registering for events.",
  sections: [
    {
      heading: "About These Terms",
      paragraphs: [
        `This website is run by the ${name}. By using it, creating an account, joining as a member or registering for an event, you agree to these terms. If you do not agree, please do not use the site.`,
      ],
    },
    {
      heading: "Your Account",
      paragraphs: [
        "You must give accurate information and keep your password private. You are responsible for what happens under your account. Your name is printed on your certificate and receipts as you enter it, so please check it is correct.",
      ],
    },
    {
      heading: "Membership",
      paragraphs: [
        "Each plan has its own eligibility, price and length, shown on the membership page. By joining, you confirm that you meet the eligibility. The society may ask for proof.",
        "Some plans need committee approval. Your membership on those plans starts when it is approved. If it is not approved, your fee is refunded.",
        "A membership that has an end date stops at that date unless you renew it.",
      ],
    },
    {
      heading: "Removal from the Society",
      paragraphs: [
        "The society may remove a member who gives false information, misuses this website or acts against its constitution. A removed member loses access to their account. Fees are not refunded on removal.",
      ],
    },
    {
      heading: "Events",
      paragraphs: [
        "Your registration is confirmed once your payment is received. Dates, venues and programmes may change, and we will tell registered participants by email.",
        "Travel, accommodation, visas and insurance are your own responsibility unless we say otherwise. Registering for an event does not mean your paper has been accepted.",
      ],
    },
    {
      heading: "The Journal",
      paragraphs: [
        "Only active members can submit work. By submitting, you confirm that the work is your own, that it has not been published elsewhere, and that you have the right to share it.",
        "Published work can be read by anyone with an account on this website. Copyright is retained by SASS and the authors. The committee decides what is published and may remove published work.",
      ],
    },
    {
      heading: "Payments",
      paragraphs: [
        "Prices are shown in Indian Rupees or US Dollars on the membership and event pages. We may change prices at any time, but this does not affect anything you have already paid for.",
        "Payments are processed securely by Razorpay. Refunds are covered by our Cancellation & Refund Policy.",
      ],
    },
    {
      heading: "Using This Website",
      paragraphs: [
        "Please do not try to break into or disrupt the site, use someone else's account, or collect details from the members list to send unwanted messages.",
      ],
    },
    {
      heading: "Content",
      paragraphs: [
        "The content of this website belongs to the society unless stated otherwise. Please do not copy it for commercial use without asking us first.",
      ],
    },
    {
      heading: "Our Liability",
      paragraphs: [
        "We work to keep this website accurate and available, but we cannot promise it will always be free of errors or interruptions. As far as the law allows, we are not liable for indirect losses, and our total liability for any membership or registration is limited to the amount you paid for it.",
      ],
    },
    {
      heading: "Changes to These Terms",
      paragraphs: [
        "We may update these terms from time to time. The date at the bottom of this page shows when they last changed.",
      ],
    },
    {
      heading: "Governing Law",
      paragraphs: [
        "These terms are governed by the laws of India. Any dispute falls under the courts of Aurangabad, Maharashtra.",
      ],
    },
    { heading: "Contact", paragraphs: [CONTACT_LINE] },
  ],
};

export const refundPolicy: LegalDocument = {
  title: "Cancellation & Refund Policy",
  description: "How to cancel, and when membership and event fees are refunded.",
  sections: [
    {
      heading: "Cancelling a Membership",
      paragraphs: [
        "You can end your membership at any time by writing to us. Membership fees are not refundable once your membership is active, except where a payment was made in error.",
      ],
    },
    {
      heading: "Plans That Need Approval",
      paragraphs: [
        "If your plan needs committee approval and the application is not approved, the full fee is refunded.",
      ],
    },
    {
      heading: "Cancelling an Event Registration",
      paragraphs: [
        "Event registration fees are not refundable once your registration is confirmed, including if you are unable to attend.",
        "If the society cancels an event, the full registration fee is refunded.",
      ],
    },
    {
      heading: "Duplicate Payments",
      paragraphs: [
        "If you are charged twice for the same membership or registration, the extra payment is refunded in full.",
      ],
    },
    {
      heading: "How to Ask for a Refund",
      paragraphs: [
        "Email us with your name, your receipt number and the reason. We aim to reply within 7 working days.",
      ],
    },
    {
      heading: "How Refunds Reach You",
      paragraphs: [
        "Refunds go back to the original payment method. Once we issue a refund, it usually reaches you within 5 to 7 working days, depending on your bank.",
      ],
    },
    { heading: "Contact", paragraphs: [CONTACT_LINE] },
  ],
};

export const deliveryPolicy: LegalDocument = {
  title: "Shipping & Delivery Policy",
  description: "How memberships, certificates and event registrations reach you.",
  sections: [
    {
      heading: "Nothing Is Shipped",
      paragraphs: [
        "SASS provides memberships and event registrations. We do not ship any physical goods. Everything is delivered by email and through your profile page.",
      ],
    },
    {
      heading: "Membership",
      paragraphs: [
        "When your payment is confirmed, your membership certificate and payment receipt are emailed to you and can be downloaded from your profile page.",
        "If your plan needs committee approval, your receipt is emailed when you pay, and your certificate is emailed once the application is approved.",
      ],
    },
    {
      heading: "Event Registration",
      paragraphs: [
        "When your payment is confirmed, your registration confirmation and payment receipt are emailed to you. Joining details follow closer to the event.",
      ],
    },
    {
      heading: "Delivery Time",
      paragraphs: [
        "Emails normally arrive within minutes of your payment being confirmed, and at the latest within 24 hours.",
      ],
    },
    {
      heading: "If Something Does Not Arrive",
      paragraphs: [
        "Please check your spam folder first, then write to us using the details below.",
        CONTACT_LINE,
      ],
    },
  ],
};
