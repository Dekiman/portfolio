export type SectionCardMediaAsset = {
  kind: "video" | "gif" | "image";
  src: string;
  alt: string;
  poster?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

export type SectionCardMedia = {
  preview?: SectionCardMediaAsset;
  expanded?: SectionCardMediaAsset;
};

export type SectionCardKind = "experience-role" | "experience-focus";

export type SectionCard = {
  title: string;
  value: string;
  description: string;
  kind?: SectionCardKind;
  detailItems?: string[];
  media?: SectionCardMedia;
  colSpan?: number;
  rowSpan?: number;
};

export type SectionLayout = "home" | "about" | "projects" | "experience" | "contact";

export type FixedSection = {
  id: string;
  title: string;
  layout: SectionLayout;
  eyebrow?: string;
  text: string;
  highlights?: string[];
  cards?: SectionCard[];
  cta?: string;
  minHeightVh: number;
};

export type SectionMetrics = {
  top: number;
  height: number;
};

export type SectionRefSetter = (index: number, node: HTMLElement | null) => void;
