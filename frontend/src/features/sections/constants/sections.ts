import type { FixedSection } from "../types/section";

function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export const SECTIONS: FixedSection[] = [
  {
    id: "home",
    title: "Home",
    layout: "home",
    eyebrow: "Gal Mankedi",
    text: "Full-stack developer building modern TypeScript products end to end, from polished React interfaces and interactive data views to backend APIs, real-time systems, and production-minded architecture.",
    highlights: [
      "React + TypeScript + Node.js",
      "Full-stack product architecture",
      "Real-time + data-heavy systems",
    ],
    cards: [
      {
        title: "Current Focus",
        value: "Full-Stack Product Engineering",
        description:
          "Building end-to-end web products with strong frontend architecture, backend systems, and practical product ownership.",
        colSpan: 6,
        rowSpan: 3,
      },
      {
        title: "Core Stack",
        value: "React · TypeScript · Node.js",
        description:
          "Typed frontend and backend development with emphasis on maintainability, performance, and delivery.",
        colSpan: 3,
        rowSpan: 2,
      },
      {
        title: "Strength",
        value: "Architecture + Problem Solving",
        description:
          "Strong CS and math thinking applied to real systems, data flow, debugging, and feature design.",
        colSpan: 3,
        rowSpan: 2,
      },
      {
        title: "Education",
        value: "Technion — Mathematics & CS",
        description:
          "Two years completed in a rigorous Mathematics and Computer Science track.",
        colSpan: 4,
        rowSpan: 2,
      },
      {
        title: "Location",
        value: "Tel Aviv Area",
        description:
          "Open to full-time roles, freelance work, and strong product-focused collaborations.",
        colSpan: 4,
        rowSpan: 2,
      },
    ],
    minHeightVh: 100,
  },
  {
    id: "about",
    title: "About",
    layout: "about",
    eyebrow: "Profile",
    text: "I build full-stack applications with clear architecture, strong UI thinking, and reliable implementation. I am comfortable owning interactive frontend systems, backend APIs, real-time features, and the data flow between them.",
    highlights: [
      "Strong product ownership",
      "Frontend architecture + backend systems",
      "Fast learner with analytical depth",
    ],
    cards: [
      {
        title: "Languages",
        value: "TypeScript · Python · C++",
        description:
          "Strong coding foundation across application development, scripting, and analytical problem solving.",
        colSpan: 4,
        rowSpan: 2,
      },
      {
        title: "Frontend",
        value: "React · Vite · Tailwind · Zustand",
        description:
          "Component systems, custom hooks, state management, responsive UI, animation, and data-dense interaction design.",
        colSpan: 4,
        rowSpan: 3,
      },
      {
        title: "Backend",
        value: "Node.js · Express · APIs · Auth",
        description:
          "REST API design, authentication flows, server-side architecture, and reliable end-to-end feature implementation.",
        colSpan: 4,
        rowSpan: 2,
      },
      {
        title: "Data & Architecture",
        value: "State Flow · API Contracts · Debugging",
        description:
          "Comfortable reasoning about data models, client-server boundaries, app structure, and scalable implementation patterns.",
        colSpan: 6,
        rowSpan: 2,
      },
      {
        title: "Real-Time Systems",
        value: "WebSockets · Live State",
        description:
          "Built real-time features such as live messaging, online presence, and state-consistent UI flows.",
        colSpan: 3,
        rowSpan: 2,
      },
    ],
    minHeightVh: 106,
  },
  {
    id: "projects",
    title: "Projects",
    layout: "projects",
    eyebrow: "Personal Project Gallery",
    text: "Personal projects built to showcase full-stack architecture, real-time communication, data-heavy interfaces, live alerts, and analytical systems.",
    highlights: [
      "Interactive product UIs",
      "Real-time event-driven systems",
      "APIs, visualization, and prediction workflows",
    ],
    cards: [
      {
        title: "Task Manager",
        value: "Hierarchy Views + Full-Stack Architecture",
        description:
          "Task management platform with graph and tree visualizations, authenticated APIs, and a React frontend built for dense hierarchical workflows.",
        media: {
          preview: {
            kind: "video",
            src: withBase("media/projects/task-manager-preview.mp4"),
            alt: "Task manager hierarchy workflow demo",
            mimeType: "video/mp4",
            width: 2206,
            height: 1728,
          },
        },
        detailItems: [
          "Built authenticated REST flows for nested task operations and structured data updates",
          "Designed graph and tree interfaces for hierarchy-heavy planning and navigation",
          "Focused on state consistency, complex UI interaction, and maintainable frontend architecture",
        ],
        colSpan: 5,
        rowSpan: 3,
      },
      {
        title: "TrackListings",
        value: "Listings Tracking Platform",
        description:
          "Built a product direction around tracking second-hand listings, processing listing data, and supporting richer decision workflows around market opportunities.",
        detailItems: [
          "Designed around listing ingestion, normalization, and analysis workflows",
          "Focused on data flow, extensible backend structure, and product-oriented UX",
          "Explored scalable architecture for search, enrichment, and operational tracking",
        ],
        colSpan: 3,
        rowSpan: 2,
      },
      {
        title: "Red Alert",
        value: "Real-Time Event Monitoring",
        description:
          "Real-time alert-oriented application centered around event delivery, responsive UI updates, and live information flow.",
        detailItems: [
          "Built around fast event propagation and timely UI feedback",
          "Handled dynamic state updates under time-sensitive conditions",
          "Emphasized clarity, responsiveness, and practical real-time UX",
        ],
        colSpan: 4,
        rowSpan: 2,
      },
      {
        title: "Chat Application",
        value: "WebSockets + Presence",
        description:
          "Real-time messaging application with online presence, event-driven communication, and state-consistent frontend behavior.",
        detailItems: [
          "Live message delivery and presence updates over WebSockets",
          "Responsive chat UI with synchronized client state",
          "Backend event flows structured around real-time feedback",
        ],
        colSpan: 4,
        rowSpan: 2,
      },
      {
        title: "Stock Prediction",
        value: "Analytical / Data-Oriented Project",
        description:
          "Prediction-focused project exploring data processing, model-oriented thinking, and structured experimentation around financial signals.",
        detailItems: [
          "Worked through prediction workflow fundamentals and data reasoning",
          "Combined programming with analytical modeling concepts",
          "Strengthened understanding of data pipelines and evaluation logic",
        ],
        colSpan: 4,
        rowSpan: 2,
      },
    ],
    minHeightVh: 118,
  },
  {
    id: "experience",
    title: "Experience",
    layout: "experience",
    eyebrow: "Work Experience",
    text: "Experience delivering software work directly with stakeholders, combined with high-constraint operational work that sharpened communication, ownership, and structured problem solving.",
    highlights: [
      "Client-facing delivery",
      "Live technical problem solving",
      "High-constraint operational thinking",
    ],
    cards: [
      {
        title: "Freelance Web Developer",
        value: "Sep 2025 - Present",
        description:
          "Built and improved production-facing web features, worked directly with stakeholders, and delivered practical product outcomes in React-based environments.",
        kind: "experience-role",
        colSpan: 6,
        rowSpan: 3,
      },
      {
        title: "Frontend Engineering",
        value: "Reusable Systems + Performance",
        description:
          "Built reusable UI components, refined rendering behavior, and improved maintainability and scalability of frontend logic.",
        kind: "experience-focus",
        colSpan: 3,
        rowSpan: 2,
      },
      {
        title: "Client Collaboration",
        value: "Direct Delivery in Live Sessions",
        description:
          "Worked collaboratively with stakeholders in real time, solving problems while communicating tradeoffs and implementation choices clearly.",
        kind: "experience-focus",
        colSpan: 4,
        rowSpan: 2,
      },
      {
        title: "SmartSchool",
        value: "Scheduling Specialist · Apr 2022 - Sep 2022",
        description:
          "Created complex weekly schedules for 20+ schools under strict constraints, requiring precision, organization, and sustained problem solving.",
        kind: "experience-role",
        colSpan: 4,
        rowSpan: 2,
      },
    ],
    minHeightVh: 108,
  },
  {
    id: "contact",
    title: "Contact",
    layout: "contact",
    eyebrow: "Open to Opportunities",
    text: "Open to full-time roles, freelance work, and product collaborations. Especially interested in full-stack, frontend-heavy, or product engineering roles where architecture and implementation both matter.",
    cta: "Email me about a role",
    highlights: [
      "Full-time or freelance",
      "Frontend / full-stack roles",
      "Remote, hybrid, or onsite",
    ],
    cards: [
      {
        title: "Email",
        value: "galmankedi@gmail.com",
        description:
          "Best for recruiter outreach, role details, collaborations, and project discussions.",
        colSpan: 4,
        rowSpan: 2,
      },
      {
        title: "Phone",
        value: "054-206-3980",
        description:
          "Best for interview scheduling or fast follow-up regarding opportunities.",
        colSpan: 4,
        rowSpan: 2,
      },
      {
        title: "Location",
        value: "Tel Aviv Area",
        description:
          "Open to onsite, hybrid, and remote collaboration depending on the role.",
        colSpan: 4,
        rowSpan: 2,
      },
    ],
    minHeightVh: 96,
  },
];

export const SECTION_NAMES = SECTIONS.map((section) => section.title);

export const DOWN_VISIBLE_TRIGGER_RATIO = 0.25;
export const UP_VISIBLE_TRIGGER_RATIO = 0.2;
export const AUTO_SCROLL_DURATION_MS = 850;
