import { siteConfig } from "@/shared/site-config";

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalDocument = {
  title: string;
  description: string;
  sections: LegalSection[];
};

const { name, emails, address, phone } = siteConfig;
const CONTACT_LINE = `${name}, ${address}. Email: ${emails[0]}. Phone: ${phone}.`;

export const LEGAL_UPDATED_ON = "2 November 2026";

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  description: "How SASS collects, uses and protects your personal information.",
  sections: [
    {
      heading: "What We Collect",
      paragraphs: [
        "When you create an account, join as a member or register for an event, we collect your name, email address, phone number, designation and affiliation. You may also add your education, experience, publications and a profile photo.",
        "Payments are handled by Razorpay. We receive a payment reference and the amount paid. We never see or store your card, UPI or bank details.",
        "When you use the contact form, we receive the details you enter there.",
      ],
    },
    {
      heading: "How We Use It",
      paragraphs: [
        "We use your information to run your membership and event registrations, issue receipts and certificates, send you emails about your membership and events, and reply to your questions.",
        "If you are an active member, your name and designation appear in the public members list. You can turn this off at any time on your profile page.",
      ],
    },
    {
      heading: "Who We Share It With",
      paragraphs: [
        "We share information only with the services that help us run this website: Razorpay for payments, Resend for sending email, and our hosting and database providers. We do not sell your information.",
      ],
    },
    {
      heading: "Keeping It Safe",
      paragraphs: [
        "Your information is sent over an encrypted connection and your password is stored only in a scrambled form that we cannot read. We keep your information for as long as you are a member and as long as we need it for our records and the law.",
      ],
    },
    {
      heading: "Your Choices",
      paragraphs: [
        "You can see and change your details on your profile page. To have your account deleted, or to ask what we hold about you, write to us using the details below.",
      ],
    },
    { heading: "Contact", paragraphs: [CONTACT_LINE] },
  ],
};

export const termsAndConditions: LegalDocument = {
  title: "Terms & Conditions",
  description: "The terms for using this website, joining SASS and registering for events.",
  sections: [
    {
      heading: "About These Terms",
      paragraphs: [
        `This website is run by the ${name}. By using it, creating an account, joining as a member or registering for an event, you agree to these terms.`,
      ],
    },
    {
      heading: "Your Account",
      paragraphs: [
        "You must give accurate information and keep your password private. You are responsible for what happens under your account.",
      ],
    },
    {
      heading: "Membership",
      paragraphs: [
        "Each plan has its own eligibility, shown on the membership page. By joining, you confirm that you meet it. The society may ask for proof of eligibility.",
        "Some plans need committee approval. Your membership on those plans starts when it is approved.",
        "The society may remove a member who gives false information or acts against its constitution. Membership fees are in Indian Rupees or US Dollars as shown on the membership page.",
      ],
    },
    {
      heading: "Events",
      paragraphs: [
        "Your registration is confirmed once your payment is received. Dates, venues and programmes may change, and we will tell registered participants by email.",
        "Travel, accommodation, visas and insurance are your own responsibility unless we say otherwise.",
      ],
    },
    {
      heading: "Payments",
      paragraphs: [
        "Payments are processed securely by Razorpay. Refunds are covered by our Refund Policy.",
      ],
    },
    {
      heading: "Content",
      paragraphs: [
        "The content of this website belongs to the society unless stated otherwise. Please do not copy it for commercial use without asking us first.",
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
  title: "Refund Policy",
  description: "When membership fees and event registration fees are refunded.",
  sections: [
    {
      heading: "Membership Fees",
      paragraphs: [
        "Membership fees are not refundable once your membership is active, except where a payment was made in error.",
        "If your plan needs committee approval and the application is not approved, the full fee is refunded.",
      ],
    },
    {
      heading: "Event Registration Fees",
      paragraphs: [
        "Event registration fees are not refundable once your registration is confirmed, except where the society cancels the event.",
        "If the society cancels an event, the full registration fee is refunded.",
      ],
    },
    {
      heading: "Duplicate Payments",
      paragraphs: [
        "If you are charged twice for the same membership or registration, the extra payment is refunded in full. Please write to us with your payment reference.",
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
  title: "Delivery Policy",
  description: "How memberships, certificates and event registrations are delivered.",
  sections: [
    {
      heading: "No Physical Delivery",
      paragraphs: [
        "SASS provides memberships and event registrations. Nothing is shipped to you. Everything is delivered by email and through your profile page.",
      ],
    },
    {
      heading: "Membership",
      paragraphs: [
        "When your payment is confirmed, your membership certificate and payment receipt are emailed to you straight away and can be downloaded from your profile page.",
        "If your plan needs committee approval, your receipt is emailed straight away and your certificate is emailed once the application is approved.",
      ],
    },
    {
      heading: "Event Registration",
      paragraphs: [
        "When your payment is confirmed, your registration confirmation and payment receipt are emailed to you straight away. Joining details follow closer to the event.",
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
