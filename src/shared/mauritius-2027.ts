import { siteConfig } from "@/shared/site-config";
import type { ConferenceDetails } from "@/shared/types";

export const mauritius2027Details: ConferenceDetails = {
  venue: "OCEP Curepipe, Mauritius",
  organizers: "jointly by SASS and OCEP, Mauritius",
  summary:
    "Artificial Intelligence is not merely a technological phenomenon. It is increasingly a social, economic, cultural, political, ethical, and institutional one. The 4th International Conference examines this rapidly changing relationship between AI and society from a broad interdisciplinary perspective.",
  coreQuestion:
    "Can Artificial Intelligence become an instrument of human and social development without compromising human agency, dignity, equality, democratic values, and the cultural diversity of societies?",
  publicationNote:
    "Selected research papers and articles will be published in an edited volume or in the Society's official peer-reviewed journal.",
  keyTopics: [
    "Human Behaviour",
    "Social Theory",
    "Economy & Work",
    "Governance & Policy",
    "Law & Ethics",
    "South Asian Dimensions",
  ],
  importantDates: [
    { label: "Offline Registration Closes", date: "November 25, 2026" },
    { label: "Abstract Submission", date: "January 6, 2027" },
    { label: "Intimation of Acceptance", date: "January 9, 2027" },
    { label: "Full Paper Submission", date: "January 12, 2027" },
    { label: "Online Registration Closes", date: "January 20, 2027" },
    { label: "Conference Dates", date: "January 29 - February 2, 2027" },
  ],
  fees: [
    { label: "Offline Participants", amount: "INR 5,000" },
    { label: "Online Participants", amount: "INR 2,000" },
  ],
  subThemes: [
    {
      title: "AI, Human Behaviour & Social Relationships",
      topics: [
        "AI and changing human behaviour; Human-AI relationships",
        "Human agency and autonomy",
        "Changing patterns of social interaction, trust, dependency & behaviour",
        "AI and everyday life, Family, Community & Social Networks",
      ],
    },
    {
      title: "AI, Sociology & Emerging Social Theory",
      topics: [
        "AI and Sociological theory; Digital Sociology",
        "Sociology of Algorithms & AI in Social Institutions",
        "AI, Social Structure and Agency",
      ],
    },
    {
      title: "AI, Economy, Commerce and Work",
      topics: [
        "AI and the future of work; Employment & labour market",
        "AI-driven entrepreneurship; Banking, finance & commerce",
        "Consumer behaviour in the digital economy",
      ],
    },
    {
      title: "AI, Governance, Democracy & Public Policy",
      topics: [
        "AI in public administration; Smart governance",
        "Algorithmic governance & democratic institutions",
        "Public policy and AI regulation",
      ],
    },
    {
      title: "AI, Law, Ethics and Human Rights",
      topics: [
        "Data privacy and protection; Cyber law",
        "Intellectual property & algorithmic accountability",
        "AI, constitutional rights, human autonomy & dignity",
      ],
    },
    {
      title: "AI, Medicine and Public Health",
      topics: [
        "AI-assisted diagnosis, treatment & digital healthcare",
        "Medical ethics, mental health & accessibility equity",
      ],
    },
    {
      title: "AI, Media, Journalism & Communication",
      topics: [
        "AI, Electronic and Print Media",
        "Generative AI, news production, deepfakes & misinformation",
        "Social media algorithms & AI and public opinion",
      ],
    },
    {
      title: "AI, Science, Technology & Innovation",
      topics: [
        "AI and scientific research; Machine learning & robotics",
        "Big data, society & human-technology interfaces",
      ],
    },
    {
      title: "AI, Environment and Sustainability",
      topics: [
        "AI in climate change, smart agriculture & disaster management",
        "Environmental monitoring & AI and sustainable development",
      ],
    },
    {
      title: "AI, Gender, Inequality & Social Inclusion",
      topics: [
        "AI and Gender; Digital divide & marginalised communities",
        "New forms of social stratification, social justice & inclusion",
      ],
    },
    {
      title: "AI, Culture, Humanities & Creativity",
      topics: [
        "AI in literature, creative arts & digital humanities",
        "Cultural heritage preservation & philosophy of AI",
      ],
    },
    {
      title: "AI and South Asian Dimensions",
      topics: [
        "AI, Language, Culture and South Asian Diversity",
        "AI, Multilingual societies & Indian/South Asian languages",
        "Religion, changing social practices & Indigenous Knowledge",
      ],
    },
  ],
  audience: [
    "Academicians",
    "Research scholars",
    "Professionals",
    "Students",
    "Civil society members",
  ],
  submissionGuidelines: [
    "Abstract: 300-500 words, with author name(s), affiliation, email ID, WhatsApp number, title of paper, and keywords.",
    "Full paper: 4,000-5,000 words, in English or Hindi, using APA citation style.",
    "English papers: MS Word, Times New Roman, size 12, 1.5 line spacing.",
    "Hindi papers: Unicode font, size 14, 1.5 line spacing.",
    `Submit the abstract and full paper as an email attachment, with the registration fee receipt, to ${siteConfig.email}.`,
  ],
  committee: [
    {
      role: "Chief Patron",
      members: [
        "Hon Dr. Reza Saumtally (Director OCEP, Member of Parliament, Mauritius)",
      ],
    },
    {
      role: "Patrons",
      members: [
        "Prof. Anand Kumar (Former Prof. of Sociology, JNU, New Delhi, India)",
        "Prof. Dipti Ranjan Sahu (President, Indian Sociological Society, India)",
        "Prof. S. Gurusamy (President Tamilnadu Sociological Association, India)",
      ],
    },
    {
      role: "President",
      members: [
        "Prof. Shaikh Mohammad Kais (Prof. of Sociology, Univ. of Rajshahi, Rajshahi, Bangladesh)",
      ],
    },
    {
      role: "Organising Secretaries",
      members: [
        "Prof. Bibhuti Bhushan Malik (Vice-Chancellor, Rajendra Univ., Balangir, Odisha)",
        "Prof. Dilip Ramdas Khairnar (Dept. of Sociology, Deogiri College, Chhatrapati Sambhajinagar, Maharashtra, India)",
      ],
    },
    {
      role: "Convenors",
      members: [
        "Prof. Rajen Suntoo (Sociologist, Mauritius - Convenor-Mauritius)",
        "Prof. B.B. Malik (VC, Rajendra University, Odisha - Convenor-India)",
        "Prof. Munesh Kumar (Prof. of Education, Univ. of Lucknow, UP, India - Convenor-India Online)",
      ],
    },
    {
      role: "Co-Convenors",
      members: [
        "Dr. Jitendra Ram (Assoc. Prof., Dept. of Sociological Studies, Central Univ. of South Bihar, Gaya, India)",
        "Prof. Praveen Kumar (Prof. of Education, Shri Jai Narain Misra PG College Lucknow, UP, India)",
      ],
    },
    {
      role: "South-Asian Committee",
      members: [
        "Prof. Uddhab Pyakurel (Nepal)",
        "Prof. Reyaz Ahmad (UAE)",
        "Prof. Noriko Nasukawa (Japan)",
        "Prof. Munshi (Bangladesh)",
      ],
    },
    {
      role: "State / Regional Committee",
      members: [
        "Prof. Dindayal Bediya (VC Barkatulla Univ.)",
        "Prof. R.N. Tripathi (VC JRD State Univ.)",
        "Prof. Pramod Kumar Gupta (Lucknow Univ.)",
        "Dr. Malaya (Karnataka)",
        "Prof. Manjula V. (Karnataka)",
        "Dr. Manoj Kumar (BHU)",
        "Prof. Tareq Ahmad (J&K)",
        "Prof. Kiran Dangwal (Uttarakhand)",
        "Prof. Priti Sharma (Chhattisgarh)",
        "Dr. Jayshree Ambewadikar (Gujarat)",
      ],
    },
    {
      role: "Coordinator",
      members: [
        "Dr. Ajay Kumar (Ambedkar School of Social Sciences, Babasaheb Bhimrao Ambedkar University, Lucknow, India)",
      ],
    },
    {
      role: "Secretarial Assistantship & Online Team",
      members: [
        "Mr. Shashank Shukla (BBAU, Lucknow)",
        "Mr. Shivam Patel (BBAU, Lucknow)",
        "Mr. Mayank Patel (Lucknow Univ., India)",
      ],
    },
  ],
  contacts: [
    {
      label: "Inquiries & Registration Support",
      value: "+91 80877 88689",
      href: "tel:+918087788689",
    },
    {
      label: "Inquiries & Registration Support",
      value: "+91 95463 19718",
      href: "tel:+919546319718",
    },
    {
      label: "Online Coordinator",
      value: "+91 94551 14607",
      href: "tel:+919455114607",
    },
    {
      label: "Email",
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
    },
  ],
  travelNote:
    "Participants requiring travel arrangements, including land and air travel packages and sightseeing, can contact the Coordinator at +91 80877 88689. SASS has arranged these through an authorized travel agency.",
};
