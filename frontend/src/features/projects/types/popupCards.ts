export type PopupCardMediaAsset = {
  kind: "video" | "gif" | "image";
  src: string;
  alt: string;
  poster?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

export type PopupCardMediaSource = PopupCardMediaAsset | PopupCardMediaAsset[];

export type PopupCardMedia = {
  preview?: PopupCardMediaSource;
  expanded?: PopupCardMediaSource;
};

export type PopupCardSurfaceTone = "light" | "dark";

export type PopupCardItem = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  description: string;
  detailItems?: string[];
  media?: PopupCardMedia;
  featured?: boolean;
  surfaceTone?: PopupCardSurfaceTone;
};

export type PopupCardsProps = {
  items: PopupCardItem[];
  ariaLabel: string;
};

export type PopupCardMediaDisplayMode = "preview" | "expanded";
export type PopupCardMediaFit = "cover" | "contain" | "fill";

export type PopupCardElementSize = {
  width: number;
  height: number;
};
