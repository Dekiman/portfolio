import type { FixedSection } from "../types/section";

function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export const SECTIONS: FixedSection[] = [
  {
    id: "about",
    title: "About",
    layout: "about",
    eyebrow: "Gal Mankedi",
    text: "Full-stack developer building TypeScript products from polished React interfaces to backend services, APIs, and real-time workflows.\n\nBest when owning the path from product experience to contracts, state, and delivery.",
    highlights: [
      "End-to-end product ownership",
      "React frontends, APIs, and live state",
      "Data-heavy and interaction-rich UI work",
      "Clear, delivery-focused collaboration",
    ],
    cards: [
      {
        title: "Focus",
        value: "Full-stack product engineering",
        description:
          "Own product work from interface decisions to backend contracts and delivery.",
        detailItems: [
          "Ship across frontend architecture, backend contracts, and release quality",
          "Prefer work with clear product scope and visible user impact",
          "Strongest when I can carry decisions through implementation",
        ],
      },
      {
        title: "Stack",
        value: "React, TypeScript, Node.js, Python",
        description:
          "Primary tools for shipped web products, supporting services, and workflow tooling.",
        detailItems: [
          "React, Vite, Tailwind CSS, Motion",
          "Node.js, Express, PostgreSQL, REST APIs",
          "WebSockets, auth flows, and stateful client-server features",
          "Python for tooling, scripting, and data-oriented work",
        ],
      },
      {
        title: "Strengths",
        value: "UI systems, APIs, real-time workflows",
        description:
          "Comfortable across component architecture, auth, data flow, and live updates.",
        detailItems: [
          "Component systems, custom hooks, and dense interaction design",
          "Clear API contracts and reliable client-server state flow",
          "Debugging across UI behavior, network logic, and backend boundaries",
        ],
      },
      {
        title: "Education",
        value: "Technion, Mathematics & Computer Science",
        description:
          "Completed two years in a rigorous Mathematics and Computer Science track.",
        detailItems: [
          "Built a strong foundation in formal reasoning and problem decomposition",
          "Learned to work through high-constraint technical problems with rigor",
        ],
      },
    ],
    minHeightVh: 98,
  },
  {
    id: "projects",
    title: "Projects",
    layout: "projects",
    eyebrow: "Project Gallery",
    text: "Personal projects showcase.",
    highlights: [
      "Interactive product UIs",
      "Real-time event-driven systems",
      "APIs, visualization, and prediction workflows",
    ],
    cards: [
      {
        title: "Red Alert",
        value: "Real-Time Event Monitoring",
        description:
          "Real-time alert-oriented application centered around event delivery, responsive UI updates, and live information flow.",
        media: {
          preview: {
            kind: "video",
            src: withBase("media/projects/red-alert-demo-1.mp4"),
            alt: "Red alert demo preview",
            mimeType: "video/mp4",
          },
          expanded: [
            {
              kind: "video",
              src: withBase("media/projects/red-alert-demo-1.mp4"),
              alt: "Red alert demo 1",
              mimeType: "video/mp4",
            },
            {
              kind: "video",
              src: withBase("media/projects/red-alert-demo-2.mp4"),
              alt: "Red alert demo 2",
              mimeType: "video/mp4",
            },
            {
              kind: "video",
              src: withBase("media/projects/red-alert-demo-3.mp4"),
              alt: "Red alert demo 3",
              mimeType: "video/mp4",
            },
          ],
        },
        detailItems: [
          "Built around fast event propagation and timely UI feedback",
          "Handled dynamic state updates under time-sensitive conditions",
          "Emphasized clarity, responsiveness, and practical real-time UX",
        ],
        colSpan: 5,
        rowSpan: 3,
      },
      {
        title: "Task Manager",
        value: "Hierarchy Views + Full-Stack Architecture",
        description:
          "Task management platform with graph and tree visualizations, authenticated APIs, and a React frontend built for dense hierarchical workflows.",
        media: {
          preview: {
            kind: "video",
            src: withBase("media/projects/task-app-demo-1.mp4"),
            alt: "Task manager hierarchy workflow demo",
            mimeType: "video/mp4",
            width: 2206,
            height: 1728,
          },
          expanded: [
            {
              kind: "video",
              src: withBase("media/projects/task-app-demo-1.mp4"),
              alt: "Task app demo 1",
              mimeType: "video/mp4",
            },
            {
              kind: "video",
              src: withBase("media/projects/task-app-demo-2.mp4"),
              alt: "Task app demo 2",
              mimeType: "video/mp4",
            },
            {
              kind: "video",
              src: withBase("media/projects/task-app-demo-3.mp4"),
              alt: "Task app demo 3",
              mimeType: "video/mp4",
            },
          ],
        },
        detailItems: [
          "Built authenticated REST flows for nested task operations and structured data updates",
          "Designed graph and tree interfaces for hierarchy-heavy planning and navigation",
          "Focused on state consistency, complex UI interaction, and maintainable frontend architecture",
        ],
        colSpan: 3,
        rowSpan: 2,
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
        title: "Boostify",
        value: "Physical-to-Online-Business Base44 App",
        description:
          "Business application built with Base44 to help physical businesses establish an online presence, present their offering clearly, and move faster from offline operations to digital customer reach.",
        media: {
          preview: {
            kind: "video",
            src: withBase("media/projects/boostify-demo-1.mp4"),
            alt: "Boostify business app demo",
            mimeType: "video/mp4",
          },
          expanded: [
            {
              kind: "video",
              src: withBase("media/projects/boostify-demo-1.mp4"),
              alt: "Boostify demo 1",
              mimeType: "video/mp4",
            },
            {
              kind: "video",
              src: withBase("media/projects/boostify-demo-2.mp4"),
              alt: "Boostify demo 2",
              mimeType: "video/mp4",
            },
            {
              kind: "video",
              src: withBase("media/projects/boostify-demo-3.mp4"),
              alt: "Boostify demo 3",
              mimeType: "video/mp4",
            },
            {
              kind: "video",
              src: withBase("media/projects/boostify-demo-4.mp4"),
              alt: "Boostify demo 4",
              mimeType: "video/mp4",
            },
          ],
        },
        detailItems: [
          "Built a fast business-facing app in Base44 for turning a physical business presence into an accessible online product",
          "Focused on clear presentation, practical flow, and low-friction customer interaction for real business use",
          "Designed for speed of delivery, useful structure, and a polished interface that supports digital business visibility",
        ],
        colSpan: 4,
        rowSpan: 2,
        surfaceTone: "light",
        
      },
    ],
    minHeightVh: 104,
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
        title: "Freelance",
        value: "Web Developer · Sep 2025 - resent",
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
    minHeightVh: 98,
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
    minHeightVh: 88,
  },
];

export const SECTION_NAMES = SECTIONS.map((section) => section.title);
