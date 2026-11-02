import type { Event, RegistrationOption } from "@/shared/types";
import { mauritius2027Details } from "./mauritius-2027";

export const upcomingEvents: Event[] = [
  {
    id: "mauritius-2027",
    title: "4th International Conference of SASS - Mauritius 2027",
    shortTitle: "Mauritius 2027 Conference",
    theme:
      "Artificial Intelligence and Society: Interdisciplinary Perspectives on Human Development, Governance, Innovation and Sustainability",
    date: "2027-01-29",
    endDate: "2027-02-02",
    dateLabel: "January 29 - February 2, 2027",
    location: "Curepipe, Mauritius",
    format: "hybrid",
    status: "upcoming",
    registrationUrl: "/events/mauritius-2027/register",
    image: "/images/events/mauritius-2027.svg",
    details: mauritius2027Details,
    registration: {
      numberCode: "MU27",
      options: [
        {
          id: "offline",
          label: "Offline (in person, Mauritius)",
          amountMinor: 500_000,
          currency: "INR",
          closesAt: "2026-11-25T23:59:59+05:30",
        },
        {
          id: "online",
          label: "Online",
          amountMinor: 200_000,
          currency: "INR",
          closesAt: "2027-01-20T23:59:59+05:30",
        },
      ],
    },
  },
];

export const previousEvents: Event[] = [
  {
    id: "3rd-international-conference",
    title: "3rd International Conference of SASS - Singapore 2026",
    theme:
      "Science, Technology, Society: Rethinking Knowledge, Power, Innovation for an Inclusive and Sustainable Future",
    date: "2026-03-08",
    endDate: "2026-03-13",
    location: "Singapore",
    format: "hybrid",
    status: "completed",
    image: "/images/events/singapore-2026.svg",
  },
  {
    id: "2nd-international-conference",
    title: "2nd International Conference of SASS - Dubai 2025",
    theme: "South Asian Society: Today and Tomorrow",
    date: "2025-03-23",
    endDate: "2025-03-26",
    location: "Dubai",
    format: "in-person",
    status: "completed",
    brochureUrl:
      "/documents/dubai-conference-brochure.pdf",
    image: "/images/events/dubai-2025.png",
    galleryLink: "/conferences/gallery",
  },
  {
    id: "1st-international-conference",
    title: "1st International Conference of SASS - Online 2024",
    theme: "Social Change",
    date: "2024-03-01",
    location: "Online",
    format: "online",
    status: "completed",
    brochureUrl:
      "/documents/south-asia-conference-brochure.pdf",
    image: "/images/events/online-2024.png",
    galleryLink: "/conferences/gallery",
  },
];

export const findEvent = (id: string) =>
  [...upcomingEvents, ...previousEvents].find((event) => event.id === id);

export const isOptionOpen = (option: RegistrationOption, now: Date) =>
  now.getTime() <= new Date(option.closesAt).getTime();

export const openOption = (event: Event, optionId: string, now: Date) =>
  event.registration?.options.find(
    (option) => option.id === optionId && isOptionOpen(option, now)
  );
