export interface CommitteeMember {
  name: string;
  title: string;
  institution: string;
  image: string;
  location?: string;
}

export interface ConferenceDetails {
  venue: string;
  organizers: string;
  summary: string;
  coreQuestion: string;
  publicationNote: string;
  keyTopics: string[];
  importantDates: { label: string; date: string }[];
  fees: { label: string; amount: string }[];
  subThemes: { title: string; topics: string[] }[];
  audience: string[];
  submissionGuidelines: string[];
  committee: { role: string; members: string[] }[];
  contacts: { label: string; value: string; href: string }[];
  travelNote: string;
}

export interface Event {
  id: string;
  title: string;
  shortTitle?: string;
  theme: string;
  date: string;
  endDate?: string;
  dateLabel?: string;
  location: string;
  format: "in-person" | "online" | "hybrid";
  status: "upcoming" | "completed";
  registrationUrl?: string;
  registrationLabel?: string;
  brochureUrl?: string;
  image?: string;
  galleryLink?: string;
  details?: ConferenceDetails;
}

export interface MembershipTier {
  name: string;
  price: string;
  currency: "INR" | "USD";
  period: "one-time" | "annual" | "4-year";
  eligibility: string;
  features: string[];
  highlighted?: boolean;
}

export interface GalleryImage {
  src: string;
  alt: string;
  event: string;
}

export interface ExternalResource {
  name: string;
  description: string;
  url: string;
  category: "scholarship" | "fellowship" | "internship" | "volunteer" | "publication";
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface LeadershipMember {
  name: string;
  role: string;
  image: string;
  institution?: string;
}

export interface Conference {
  number: string;
  year: string;
  venue: string;
  theme: string;
}
