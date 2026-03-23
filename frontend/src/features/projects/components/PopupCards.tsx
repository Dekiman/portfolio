import { LayoutGroup } from "motion/react";
import { memo, useMemo, useState } from "react";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";
import { useExpandedMediaPreload } from "../hooks/useExpandedMediaPreload";
import {
  createPopupCardsSelectionStore,
  PopupCardsSelectionContext,
} from "../hooks/usePopupCardSelection";
import type { PopupCardItem, PopupCardsProps } from "../types/popupCards";
import { PopupCardsDialogController } from "./popupCards/PopupCardDialog";
import { PopupCardsGridShell } from "./popupCards/PopupCardPreviews";

function splitPopupCards(items: PopupCardItem[]) {
  const featuredCard = items.find((item) => item.featured) ?? items[0] ?? null;

  return {
    cardsById: new Map(items.map((item) => [item.id, item])),
    featuredCard,
    galleryCards: featuredCard
      ? items.filter((item) => item.id !== featuredCard.id)
      : [],
  };
}

export const PopupCards = memo(function PopupCards({
  items,
  ariaLabel,
}: PopupCardsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selectionStore] = useState(createPopupCardsSelectionStore);

  useExpandedMediaPreload(items);

  const { cardsById, featuredCard, galleryCards } = useMemo(
    () => splitPopupCards(items),
    [items],
  );

  return (
    <PopupCardsSelectionContext.Provider value={selectionStore}>
      <LayoutGroup id="popup-cards">
        <section className="popup-cards" aria-label={ariaLabel}>
          <PopupCardsGridShell
            featuredCard={featuredCard}
            galleryCards={galleryCards}
            prefersReducedMotion={prefersReducedMotion}
          />

          <PopupCardsDialogController
            cardsById={cardsById}
            prefersReducedMotion={prefersReducedMotion}
          />
        </section>
      </LayoutGroup>
    </PopupCardsSelectionContext.Provider>
  );
});

export type { PopupCardItem } from "../types/popupCards";
