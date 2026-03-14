import { HeaderIcon } from "../Components/HeaderIcon";
import { SectionHeader } from "../Components/SectionHeader";
import { ScrollProgressBar } from "../Components/ScrollProgressBar";
import { SectionDeck } from "../features/sections/components/SectionDeck";
import {
  SECTION_NAMES,
  SECTIONS,
} from "../features/sections/constants/sections";
import { useSectionSnapNavigation } from "../features/sections/hooks/useSectionSnapNavigation";
import { useIsCompactViewport } from "../hooks/useIsCompactViewport";
import { useSmoothWheelScroll } from "../hooks/useSmoothWheelScroll";

const RESUME_PATH = "/resume.pdf";

export function AppLayout() {
  useSmoothWheelScroll();
  const isCompactViewport = useIsCompactViewport();
  const {
    activeSectionIndex,
    furthestSectionIndex,
    handleSectionHeaderClick,
    setSectionRef,
  } =
    useSectionSnapNavigation({
      sectionCount: SECTIONS.length,
      autoSnapEnabled: false,
    });

  return (
    <>
      <ScrollProgressBar compact={isCompactViewport} />
      <div className={`top-controls${isCompactViewport ? " top-controls--compact" : ""}`}>
        <SectionHeader
          key={isCompactViewport ? "compact" : "full"}
          sectionNames={SECTION_NAMES}
          activeIndex={activeSectionIndex}
          compact={isCompactViewport}
          onSectionClick={handleSectionHeaderClick}
        >
          <a
            className={`floating-sections__action${isCompactViewport ? " floating-sections__action--compact" : ""}`}
            href={RESUME_PATH}
            target="_blank"
            rel="noreferrer"
            aria-label="Open resume PDF"
          >
            <span
              className={`floating-sections__label floating-sections__label--resume${
                isCompactViewport ? " floating-sections__label--icon-only" : ""
              }`}
            >
              <span className="floating-sections__icon-shell">
                <HeaderIcon kind="resume" className="floating-sections__icon" />
              </span>
              <span className="floating-sections__label-text">Resume</span>
            </span>
          </a>
        </SectionHeader>
      </div>
      <main className="page">
        <SectionDeck
          sections={SECTIONS}
          onSectionRef={setSectionRef}
          furthestSectionIndex={furthestSectionIndex}
          revealAllSections={isCompactViewport}
        />
      </main>
    </>
  );
}
