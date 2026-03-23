import { memo, useMemo } from "react";
import { HeaderIcon } from "../ui/navigation/HeaderIcon";
import { SectionHeader } from "../ui/navigation/SectionHeader";
import { SectionDeck } from "../features/sections/components/SectionDeck";
import {
  SECTION_NAMES,
  SECTIONS,
} from "../features/sections/constants/sections";
import { useSectionSnapNavigation } from "../features/sections/hooks/useSectionSnapNavigation";
import { useIsCompactViewport } from "../hooks/useIsCompactViewport";

const RESUME_PATH = "/resume.pdf";

const ResumeAction = memo(function ResumeAction({
  compact,
}: {
  compact: boolean;
}) {
  return (
    <a
      className={`floating-sections__action${compact ? " floating-sections__action--compact" : ""}`}
      href={RESUME_PATH}
      target="_blank"
      rel="noreferrer"
      aria-label="Open resume PDF"
    >
      <span
        className={`floating-sections__label floating-sections__label--resume${
          compact ? " floating-sections__label--icon-only" : ""
        }`}
      >
        <span className="floating-sections__icon-shell">
          <HeaderIcon kind="resume" className="floating-sections__icon" />
        </span>
        <span className="floating-sections__label-text">Resume</span>
      </span>
    </a>
  );
});

const TopControls = memo(function TopControls({
  compact,
  activeSectionIndex,
  onSectionClick,
}: {
  compact: boolean;
  activeSectionIndex: number;
  onSectionClick: (sectionIndex: number) => void;
}) {
  const resumeAction = useMemo(
    () => <ResumeAction compact={compact} />,
    [compact],
  );

  return (
    <div className={`top-controls${compact ? " top-controls--compact" : ""}`}>
      <SectionHeader
        key={compact ? "compact" : "full"}
        sectionNames={SECTION_NAMES}
        activeIndex={activeSectionIndex}
        compact={compact}
        onSectionClick={onSectionClick}
      >
        {resumeAction}
      </SectionHeader>
    </div>
  );
});

export function AppLayout() {
  const isCompactViewport = useIsCompactViewport();
  const {
    activeSectionIndex,
    handleSectionHeaderClick,
    setSectionRef,
  } = useSectionSnapNavigation({
    sectionCount: SECTIONS.length,
  });

  return (
    <>
      <TopControls
        compact={isCompactViewport}
        activeSectionIndex={activeSectionIndex}
        onSectionClick={handleSectionHeaderClick}
      />
      <main className="page" data-app-scroll-container>
        <div className="page__surface">
          <SectionDeck
            sections={SECTIONS}
            onSectionRef={setSectionRef}
          />
        </div>
      </main>
    </>
  );
}
