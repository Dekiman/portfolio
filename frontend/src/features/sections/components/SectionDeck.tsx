import type { FixedSection, SectionRefSetter } from "../types/section";
import { PageSection } from "./PageSection";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";

type SectionDeckProps = {
  sections: FixedSection[];
  onSectionRef: SectionRefSetter;
  furthestSectionIndex: number;
  revealAllSections?: boolean;
};

export function SectionDeck({
  sections,
  onSectionRef,
  furthestSectionIndex,
  revealAllSections = false,
}: SectionDeckProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      {sections.map((section, index) => (
        <PageSection
          key={section.title}
          section={section}
          sectionIndex={index}
          onSectionRef={onSectionRef}
          isRevealed={revealAllSections || prefersReducedMotion || index <= furthestSectionIndex}
        />
      ))}
    </>
  );
}
