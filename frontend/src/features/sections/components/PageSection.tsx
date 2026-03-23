import type { CSSProperties } from "react";
import { SectionLayout } from "./SectionLayouts";
import type { FixedSection, SectionRefSetter } from "../types/section";

type PageSectionProps = {
  section: FixedSection;
  sectionIndex: number;
  onSectionRef: SectionRefSetter;
};

export function PageSection({
  section,
  sectionIndex,
  onSectionRef,
}: PageSectionProps) {
  const variantIndex = sectionIndex + 1;

  const sectionStyle = {
    "--section-target-min-height": `${section.minHeightVh}svh`,
  } as CSSProperties;

  return (
    <section
      className={`page-section page-section--${variantIndex}`}
      style={sectionStyle}
      ref={(node) => {
        onSectionRef(sectionIndex, node);
      }}
    >
      <div className={`section-layout-wrap section-layout-wrap--${section.layout}`}>
        <SectionLayout section={section} variantIndex={variantIndex} />
      </div>
    </section>
  );
}
