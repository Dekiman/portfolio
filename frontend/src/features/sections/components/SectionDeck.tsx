import type { FixedSection, SectionRefSetter } from "../types/section";
import { PageSection } from "./PageSection";

type SectionDeckProps = {
  sections: FixedSection[];
  onSectionRef: SectionRefSetter;
};

export function SectionDeck({
  sections,
  onSectionRef,
}: SectionDeckProps) {
  return (
    <>
      {sections.map((section, index) => (
        <PageSection
          key={section.title}
          section={section}
          sectionIndex={index}
          onSectionRef={onSectionRef}
        />
      ))}
    </>
  );
}
