import { motion } from "motion/react";
import { memo, useCallback, useEffect, useState, type ReactNode } from "react";
import {
  useIsPopupCardActive,
  usePopupCardsSelectionStore,
} from "../../hooks/usePopupCardSelection";
import type { PopupCardItem } from "../../types/popupCards";
import {
  getPopupCardVisualLayoutId,
  POPUP_CARD_LAYOUT_TRANSITION,
} from "../../utils/popupCardLayout";
import { getPreviewMedia, isVideoAsset } from "../../utils/popupCardMedia";
import { getPopupCardSurfaceTone } from "../../utils/popupCardTone";
import { PopupCardMediaRenderer } from "./PopupCardMedia";

type PreviewCardProps = {
  card: PopupCardItem;
  prefersReducedMotion: boolean;
};

const POPUP_CARD_PREVIEW_HOVER_PLAY_DELAY_MS = 1000;

const PopupCardPreviewButton = memo(function PopupCardPreviewButton({
  card,
  prefersReducedMotion,
  buttonClassName,
  visualClassName,
  children,
}: PreviewCardProps & {
  buttonClassName: string;
  visualClassName: string;
  children: ReactNode;
}) {
  const store = usePopupCardsSelectionStore();
  const previewMedia = getPreviewMedia(card);
  const isActive = useIsPopupCardActive(card.id);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const canHoverPlayPreview = isVideoAsset(previewMedia) && !prefersReducedMotion;
  const surfaceTone = getPopupCardSurfaceTone(card);

  const handleOpen = useCallback(() => {
    store.openCard(card.id);
  }, [card.id, store]);
  const handlePreviewPlaybackStart = useCallback(() => {
    if (!canHoverPlayPreview || isActive) {
      return;
    }

    setIsPreviewHovered(true);
  }, [canHoverPlayPreview, isActive]);
  const handlePreviewPlaybackStop = useCallback(() => {
    setIsPreviewHovered(false);
  }, []);

  useEffect(() => {
    if (!canHoverPlayPreview || isActive) {
      setIsPreviewHovered(false);
    }
  }, [canHoverPlayPreview, isActive]);

  return (
    <motion.button
      type="button"
      className={`${buttonClassName}${isActive ? " popup-card--selected" : ""}`}
      data-surface-tone={surfaceTone}
      layoutId={`popup-card-${card.id}`}
      onClick={handleOpen}
      onHoverStart={handlePreviewPlaybackStart}
      onHoverEnd={handlePreviewPlaybackStop}
      aria-label={`Open personal project: ${card.title}`}
      aria-haspopup="dialog"
      transition={POPUP_CARD_LAYOUT_TRANSITION}
    >
      <motion.div
        className={visualClassName}
        layoutId={getPopupCardVisualLayoutId(card.id)}
        transition={POPUP_CARD_LAYOUT_TRANSITION}
      >
        <PopupCardMediaRenderer
          asset={previewMedia}
          cardId={card.id}
          mode="preview"
          className="popup-card__media"
          fit="cover"
          shouldPlay={canHoverPlayPreview && isPreviewHovered}
          playbackDelayMs={POPUP_CARD_PREVIEW_HOVER_PLAY_DELAY_MS}
        />
      </motion.div>

      {children}
    </motion.button>
  );
});

const FeaturedCardPreview = memo(function FeaturedCardPreview({
  card,
  prefersReducedMotion,
}: PreviewCardProps) {
  return (
    <PopupCardPreviewButton
      card={card}
      prefersReducedMotion={prefersReducedMotion}
      buttonClassName="popup-card popup-card--featured"
      visualClassName="popup-card__visual popup-card__visual--featured"
    >
      <div className="popup-card__copy popup-card__copy--featured">
        {card.eyebrow ? <p className="popup-card__eyebrow">{card.eyebrow}</p> : null}

        <div className="popup-card__headline">
          <h3 className="popup-card__title popup-card__title--featured">
            {card.title}
          </h3>
          <p className="popup-card__subtitle popup-card__subtitle--featured">
            {card.subtitle}
          </p>
        </div>

        <p className="popup-card__summary">{card.description}</p>

        <span className="popup-card__action popup-card__action--featured" aria-hidden="true">
          Open notes
        </span>
      </div>
    </PopupCardPreviewButton>
  );
});

const GalleryCardPreview = memo(function GalleryCardPreview({
  card,
  prefersReducedMotion,
}: PreviewCardProps) {
  return (
    <PopupCardPreviewButton
      card={card}
      prefersReducedMotion={prefersReducedMotion}
      buttonClassName="popup-card popup-card--gallery"
      visualClassName="popup-card__visual popup-card__visual--gallery"
    >
      <div className="popup-card__copy popup-card__copy--gallery">
        {card.eyebrow ? (
          <p className="popup-card__eyebrow popup-card__eyebrow--gallery">
            {card.eyebrow}
          </p>
        ) : null}

        <div className="popup-card__headline popup-card__headline--gallery">
          <h3 className="popup-card__title popup-card__title--gallery">
            {card.title}
          </h3>
          <p className="popup-card__subtitle popup-card__subtitle--gallery">
            {card.subtitle}
          </p>
        </div>

        <span
          className="popup-card__action popup-card__action--gallery"
          aria-hidden="true"
        >
          Open build
        </span>
      </div>
    </PopupCardPreviewButton>
  );
});

export const PopupCardsGridShell = memo(function PopupCardsGridShell({
  featuredCard,
  galleryCards,
  prefersReducedMotion,
}: {
  featuredCard: PopupCardItem | null;
  galleryCards: PopupCardItem[];
  prefersReducedMotion: boolean;
}) {
  if (!featuredCard) {
    return null;
  }

  return (
    <section className="popup-cards__layout" aria-label="Project gallery">
      {galleryCards.length > 0 ? (
        <div className="popup-cards__gallery-header">
          <p className="popup-cards__gallery-label">Gallery</p>
          <p className="popup-cards__gallery-description">
            Personal builds exploring interface systems, realtime behavior, and
            application architecture.
          </p>
        </div>
      ) : null}

      <div
        className={`popup-cards__gallery-grid${galleryCards.length === 0 ? " popup-cards__gallery-grid--standalone" : ""}`}
      >
        <FeaturedCardPreview
          card={featuredCard}
          prefersReducedMotion={prefersReducedMotion}
        />

        {galleryCards.map((card) => (
          <GalleryCardPreview
            key={card.id}
            card={card}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </section>
  );
});
