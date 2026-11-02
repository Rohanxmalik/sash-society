import type { Currency } from "./money";

export type PlanPeriod = "one-time" | "annual" | "4-year";

export interface MembershipPlan {
  slug: string;
  name: string;
  amountMinor: number;
  currency: Currency;
  period: PlanPeriod;
  durationMonths: number | null;
  requiresApproval: boolean;
  isOrganisation: boolean;
  numberCode: string;
  eligibility: string;
  features: string[];
  highlighted?: boolean;
}

export const membershipPlans: MembershipPlan[] = [
  {
    slug: "life-india",
    name: "Life Membership (India)",
    amountMinor: 1_000_000,
    currency: "INR",
    period: "one-time",
    durationMonths: null,
    requiresApproval: false,
    isOrganisation: false,
    numberCode: "LM",
    eligibility: "University degree in social sciences + valid ID",
    features: [
      "One-time payment",
      "Free renewal every 5 years",
      "Full voting rights",
      "Free online Sociological Bulletin",
      "Conference participation",
    ],
    highlighted: true,
  },
  {
    slug: "life-south-asia",
    name: "Life Membership (South Asia)",
    amountMinor: 11_600,
    currency: "USD",
    period: "one-time",
    durationMonths: null,
    requiresApproval: false,
    isOrganisation: false,
    numberCode: "LS",
    eligibility: "University degree in social sciences, South Asian resident",
    features: [
      "One-time payment",
      "Full voting rights",
      "Free online Sociological Bulletin",
      "Conference participation",
    ],
  },
  {
    slug: "life-abroad",
    name: "Life Membership (Abroad)",
    amountMinor: 30_000,
    currency: "USD",
    period: "one-time",
    durationMonths: null,
    requiresApproval: true,
    isOrganisation: false,
    numberCode: "LA",
    eligibility: "University degree, outside South Asia",
    features: [
      "One-time payment",
      "Committee approval required",
      "Full voting rights",
      "Free online Sociological Bulletin",
    ],
  },
  {
    slug: "individual",
    name: "Individual Membership",
    amountMinor: 300_000,
    currency: "INR",
    period: "4-year",
    durationMonths: 48,
    requiresApproval: false,
    isOrganisation: false,
    numberCode: "IM",
    eligibility: "University degree in social sciences",
    features: [
      "4-year duration (Jan 1 - Dec 31)",
      "Also available at US $35",
      "Conference participation",
      "Journal access",
    ],
  },
  {
    slug: "ordinary",
    name: "Ordinary Membership",
    amountMinor: 100_000,
    currency: "INR",
    period: "annual",
    durationMonths: 12,
    requiresApproval: true,
    isOrganisation: false,
    numberCode: "OM",
    eligibility: "University degree in social sciences",
    features: [
      "Annual renewal",
      "2/3rd Managing Committee approval",
      "Conference participation",
      "Journal access",
    ],
  },
  {
    slug: "student",
    name: "Student Membership",
    amountMinor: 50_000,
    currency: "INR",
    period: "annual",
    durationMonths: 12,
    requiresApproval: false,
    isOrganisation: false,
    numberCode: "ST",
    eligibility: "Active student ID in social sciences",
    features: [
      "Most affordable option",
      "Annual renewal",
      "Conference participation",
      "Journal access",
    ],
  },
  {
    slug: "institutional",
    name: "Institutional Membership",
    amountMinor: 1_000_000,
    currency: "INR",
    period: "one-time",
    durationMonths: null,
    requiresApproval: false,
    isOrganisation: true,
    numberCode: "IN",
    eligibility: "Academic institutions and organizations",
    features: [
      "Up to 3 delegates",
      "Free online Sociological Bulletin",
      "No voting rights",
      "Institutional recognition",
    ],
  },
  {
    slug: "societies",
    name: "Social Science Societies",
    amountMinor: 100_000,
    currency: "INR",
    period: "annual",
    durationMonths: 12,
    requiresApproval: false,
    isOrganisation: true,
    numberCode: "SS",
    eligibility: "Regional associations and societies",
    features: [
      "Up to 3 delegates",
      "Free journal access",
      "No voting rights",
      "Network collaboration",
    ],
  },
];

export const findPlan = (slug: string | null | undefined) =>
  membershipPlans.find((plan) => plan.slug === slug);

export const periodLabel = (period: PlanPeriod) =>
  ({
    "one-time": "One-time payment",
    annual: "Per year",
    "4-year": "4-year duration",
  })[period];
