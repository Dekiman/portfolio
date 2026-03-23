import type {
  PopupCardItem,
  PopupCardSurfaceTone,
} from "../types/popupCards";

export const DEFAULT_POPUP_CARD_SURFACE_TONE: PopupCardSurfaceTone = "dark";

export function getPopupCardSurfaceTone(
  card: Pick<PopupCardItem, "surfaceTone">,
): PopupCardSurfaceTone {
  return card.surfaceTone ?? DEFAULT_POPUP_CARD_SURFACE_TONE;
}
