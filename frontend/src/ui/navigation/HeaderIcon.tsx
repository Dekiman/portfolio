export type HeaderIconKind =
  | "home"
  | "about"
  | "projects"
  | "experience"
  | "contact"
  | "resume";

type HeaderIconProps = {
  kind: HeaderIconKind;
  className?: string;
};

export function HeaderIcon({
  kind,
  className,
}: HeaderIconProps) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (kind) {
    case "home":
      return (
        <svg {...commonProps}>
          <path d="M3.75 10.25 12 4l8.25 6.25" />
          <path d="M5.25 9.5V20h13.5V9.5" />
          <path d="M9.5 20v-5.75h5V20" />
        </svg>
      );
    case "about":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8.25" r="3.25" />
          <path d="M5.5 19.25c1.35-3 3.6-4.5 6.5-4.5s5.15 1.5 6.5 4.5" />
        </svg>
      );
    case "projects":
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="5" width="15" height="14" rx="2.5" />
          <path d="M4.5 9.5h15" />
          <path d="M9 5v4.5" />
        </svg>
      );
    case "experience":
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="7" width="15" height="11.5" rx="2.25" />
          <path d="M9 7V5.75A1.75 1.75 0 0 1 10.75 4h2.5A1.75 1.75 0 0 1 15 5.75V7" />
          <path d="M4.5 11.25h15" />
        </svg>
      );
    case "contact":
      return (
        <svg {...commonProps}>
          <rect x="4" y="6" width="16" height="12" rx="2.25" />
          <path d="m5.5 7.75 6.5 5 6.5-5" />
        </svg>
      );
    case "resume":
      return (
        <svg {...commonProps}>
          <path d="M8 4.5h6l3 3V19a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19V6a1.5 1.5 0 0 1 1-1.5Z" />
          <path d="M14 4.5V8h3" />
          <path d="M9.5 11h5" />
          <path d="M9.5 14h5" />
          <path d="M9.5 17h3.25" />
        </svg>
      );
  }
}
