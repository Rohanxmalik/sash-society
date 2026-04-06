import type { NavItem } from "@/types";

export const navigation: NavItem[] = [
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Constitution", href: "/constitution" },
      { label: "Achievement Awards", href: "/achievement-awards" },
    ],
  },
  {
    label: "Committees",
    href: "/committees/advisory",
    children: [
      { label: "Advisory Committee", href: "/committees/advisory" },
      { label: "International Committee", href: "/committees/international" },
      { label: "National Committee", href: "/committees/national" },
      { label: "Regional Committee", href: "/committees/regional" },
    ],
  },
  {
    label: "Conferences",
    href: "/conferences",
    children: [
      { label: "SASS Conferences", href: "/conferences" },
      { label: "Young Research Scholars Workshop", href: "/conferences/workshops" },
      { label: "Conference Guidelines", href: "/conferences/guidelines" },
      { label: "Chronology of SASS", href: "/conferences/chronology" },
      { label: "SASS Gallery", href: "/conferences/gallery" },
    ],
  },
  {
    label: "Events",
    href: "/events/upcoming",
    children: [
      { label: "Upcoming Events", href: "/events/upcoming" },
      { label: "Previous Events", href: "/events/previous" },
    ],
  },
  {
    label: "Membership",
    href: "/membership",
    children: [
      { label: "Become a Member", href: "/membership" },
      { label: "Members List", href: "/membership/members" },
    ],
  },
  { label: "Journal", href: "/journal" },
  { label: "Resources", href: "/network-publications",
    children: [
      { label: "Network & Publications", href: "/network-publications" },
      { label: "Student & Career", href: "/student-career" },
    ],
  },
  { label: "Contact", href: "/contact" },
];
