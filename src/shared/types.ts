import type { Currency } from "./money";

export interface CommitteeMember {
  name: string;
  title: string;
  institution: string;
  // Members without a photo show their initials instead.
  image?: string;
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

export interface SpecialLecture {
  title: string;
  series: string;
  speaker: string;
  speakerRole: string;
  date: string;
  poster: string;
}

// What a past conference's brochure carried, without registration, bank details
// or personal contact details, which ended with the conference.
export interface ConferenceBrochure {
  organizers: string;
  concept: string[];
  questions?: string[];
  objectives?: string[];
  subThemesIntro?: string;
  subThemes: { title: string; topics: string[] }[];
  speakers?: { name: string; role: string }[];
  lectures?: SpecialLecture[];
  committee: { role: string; members: string[] }[];
}

export interface RegistrationOption {
  id: string;
  label: string;
  amountMinor: number;
  currency: Currency;
  // ISO time with offset, the moment this option stops taking registrations.
  closesAt: string;
}

export interface EventRegistration {
  numberCode: string;
  options: RegistrationOption[];
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
  image?: string;
  galleryLink?: string;
  // Folder under public/ holding this conference's photos.
  photos?: string;
  details?: ConferenceDetails;
  brochure?: ConferenceBrochure;
  registration?: EventRegistration;
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
