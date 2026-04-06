export interface CommitteeMember {
  name: string;
  title: string;
  institution: string;
  image: string;
  location?: string;
}

export interface Event {
  id: string;
  title: string;
  theme: string;
  date: string;
  endDate?: string;
  location: string;
  format: "in-person" | "online" | "hybrid";
  status: "upcoming" | "completed";
  registrationUrl?: string;
  brochureUrl?: string;
  image?: string;
  galleryLink?: string;
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
