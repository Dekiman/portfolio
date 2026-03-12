import { SectionHeader } from "../Components/SectionHeader";
import { ScrollProgressBar } from "../Components/ScrollProgressBar";
import { SectionDeck } from "../features/sections/components/SectionDeck";
import {
  SECTION_NAMES,
  SECTIONS,
} from "../features/sections/constants/sections";
import { useSectionSnapNavigation } from "../features/sections/hooks/useSectionSnapNavigation";
import { useSmoothWheelScroll } from "../hooks/useSmoothWheelScroll";

const RESUME_PATH = "/resume.pdf";

export function AppLayout() {
  useSmoothWheelScroll();
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
      <ScrollProgressBar />
      <div className="top-controls">
        <SectionHeader
          sectionNames={SECTION_NAMES}
          activeIndex={activeSectionIndex}
          onSectionClick={handleSectionHeaderClick}
        >
          <a
            className="floating-sections__action"
            href={RESUME_PATH}
            target="_blank"
            rel="noreferrer"
            aria-label="Open resume PDF"
          >
            <span className="floating-sections__label floating-sections__label--resume">
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
        />
      </main>
    </>
  );
}
