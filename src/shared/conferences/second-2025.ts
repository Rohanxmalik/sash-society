import type { ConferenceBrochure } from "@/shared/types";

const ONLINE_LECTURE = "Online Special Lecture";

export const secondConferenceBrochure: ConferenceBrochure = {
  organizers: "Organized by the South Asian Sociological Society, with online participation and registration.",
  concept: [
    'The South Asian Sociological Society is proud to present an international conference on the theme "South Asian Society: Today and Tomorrow" in the vibrant city of Dubai. This conference aims to bring together scholars, policymakers, and practitioners to explore the dynamics of South Asian societies, examining their current challenges and envisioning their future trajectories. The conference will delve into the socio-political, economic, cultural, and educational transformations shaping South Asia today due to ongoing transformation and interventions. The conference provides a platform for critical discussions and collaborative solutions, developing future directions and interventions.',
  ],
  objectives: [
    "Analyse Current Challenges: Address pressing socio-political issues, economic inequalities, environmental crises, and the rapidly changing cultural landscapes within South Asia.",
    "Envision Future Pathways: Explore sustainable trajectories for societal growth, emphasizing inclusive development, equitable resource distribution, and resilient governance systems.",
    "Foster Interdisciplinary Collaboration: Bring together experts, policymakers and practitioners from diverse fields to create synergies for collective solutions.",
  ],
  subThemesIntro:
    "The conference focuses on (but is not limited to) all areas of theoretical and empirical research in the following fields:",
  subThemes: [
    {
      title: "Society and Social Change",
      topics: [
        "Emerging Gender and Disability: Perspectives",
        "Urbanization and Rural Development",
        "Digital Transformation and Social Media Impact",
      ],
    },
    {
      title: "Politics and Governance",
      topics: [
        "Democracy and Political Movements",
        "Public Policy and Administrative Reforms",
        "Cross-Border Relations and Regional Cooperation",
      ],
    },
    {
      title: "Economics and Development",
      topics: [
        "Globalization and Its Impacts",
        "Employment Patterns and Gig Economies",
        "Poverty Alleviation and Sustainable Development",
      ],
    },
    {
      title: "Education and Human Capital",
      topics: [
        "Educational Reforms and Innovations",
        "Skill Development for Future Generations",
        "Role of Higher Education in Societal Transformation",
      ],
    },
    {
      title: "Culture and Heritage",
      topics: [
        "Preserving South Asian Traditions",
        "Impact of Diaspora on Cultural Identity",
        "Arts, Literature, and Performing Arts",
      ],
    },
    {
      title: "Environmental and Health Challenges",
      topics: [
        "Climate Change and Disaster Management",
        "Public Health Systems and Emerging Diseases",
        "Urban Planning and Environmental Sustainability",
      ],
    },
    {
      title: "Society and Artificial Intelligence",
      topics: [
        "AI in Media and Entertainment: Shaping Cultural Narratives",
        "AI and Social Inequalities: Bridging or Widening the Gap?",
        "Responsible AI: Policies and Ethical Frameworks",
      ],
    },
    {
      title: "Health, Wellness, and Medical Science",
      topics: [
        "Pandemic Preparedness and Social Impacts in South Asia",
        "Wellness Practices: From Tradition to Modernity",
        "Healthcare Accessibility and Rural-Urban Divide",
      ],
    },
    {
      title: "Science, Technology, and Innovation",
      topics: [
        "Renewable Energy and Climate Change Innovations",
        "Space Science Contributions from South Asia",
        "The Role of Startups in Driving Innovation",
      ],
    },
    {
      title: "Society, Trade, and Commerce",
      topics: [
        "Informal Economies and Social Structures",
        "Globalization and Its Impact on Local Businesses",
        "Trade Policies and Economic Inequality",
      ],
    },
    {
      title: "Religion, Values, and Transformation",
      topics: [
        "Digital Platforms and Religious Discourse",
        "Ritual Practices in Changing Urban Contexts",
        "Youth Perspectives on Religion and Modernity",
      ],
    },
  ],
  lectures: [
    {
      title: "Globalisation and its Impact on Indian Society",
      series: ONLINE_LECTURE,
      speaker: "Prof. B.K. Nagla (Retd.)",
      speakerRole: "MDU Rohtak, Haryana",
      date: "23 March 2025, 8.00 pm IST",
      poster: "/images/lectures/2025-globalisation-and-indian-society.jpg",
    },
    {
      title: "Practice of Sociology in South Asia: Some Converging Themes",
      series: ONLINE_LECTURE,
      speaker: "Maitrayee Chaudhuri",
      speakerRole: "Former Professor, JNU, New Delhi; President, Indian Sociological Society",
      date: "24 March 2025, 8.00 pm IST",
      poster: "/images/lectures/2025-practice-of-sociology-in-south-asia.jpg",
    },
    {
      title: "Ambedkarism: Philosophy, Epistemology, and Theory",
      series: ONLINE_LECTURE,
      speaker: "Dr. Jeffery D. Long",
      speakerRole:
        "Carl W. Zeigler Professor of Religion, Philosophy, & Asian Studies, School of Arts & Humanities, Elizabethtown College",
      date: "25 March 2025, 8.00 pm IST",
      poster: "/images/lectures/2025-ambedkarism.jpg",
    },
    {
      title: "Explaining Culture: As an Interpretive and Pragmatic Phenomenon",
      series: ONLINE_LECTURE,
      speaker: "Prof. K.L. Sharma",
      speakerRole: "Former Vice-Chancellor, Rajasthan University",
      date: "26 March 2025, 8.00 pm IST",
      poster: "/images/lectures/2025-explaining-culture.jpg",
    },
  ],
  committee: [
    {
      role: "Organizers",
      members: [
        "Prof. Shaikh Moh. Kais, President, SASS",
        "Prof. B.B. Malik, Secretary, SASS",
        "Prof. Dilip Khairnar, Treasurer, SASS",
      ],
    },
  ],
};
