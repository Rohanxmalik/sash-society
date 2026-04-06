import type { Event } from "@/types";

export const upcomingEvents: Event[] = [
  {
    id: "3rd-international-conference",
    title: "3rd International Conference of SASS - Singapore 2026",
    theme:
      "Science, Technology, Society: Rethinking Knowledge, Power, Innovation for an Inclusive and Sustainable Future",
    date: "2026-03-08",
    endDate: "2026-03-13",
    location: "Singapore",
    format: "hybrid",
    status: "upcoming",
    registrationUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfaLt6H8InsSg1W8ct0LYM1BMujYIXmgQsLNBo3xivacGQCxg/viewform",
    image: "/images/events/singapore-2026.svg",
  },
];

export const previousEvents: Event[] = [
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
