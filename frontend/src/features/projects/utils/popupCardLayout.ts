export const POPUP_CARD_LAYOUT_TRANSITION = {
  type: "tween" as const,
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function getPopupCardVisualLayoutId(cardId: string): string {
  return `popup-card-visual-${cardId}`;
}

export function getPopupCardMediaFrameLayoutId(cardId: string): string {
  return `popup-card-media-frame-${cardId}`;
}
