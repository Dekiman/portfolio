import { AnimatePresence, motion } from "motion/react";
import {
  memo,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  usePopupCardsSelectionStore,
  useSelectedPopupCardId,
} from "../../hooks/usePopupCardSelection";
import type { PopupCardItem } from "../../types/popupCards";
import {
  getPopupCardVisualLayoutId,
  POPUP_CARD_LAYOUT_TRANSITION,
} from "../../utils/popupCardLayout";
import { getExpandedMedia, getPrimaryExpandedMedia } from "../../utils/popupCardMedia";
import { PopupCardMediaRenderer } from "./PopupCardMedia";

const POPUP_CARD_EXPANDED_PLAYBACK_DELAY_MS = 500;

function useEscapeToClose(enabled: boolean, onClose: () => void) {
  const handleClose = useEffectEvent(onClose);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}

function useScrollContainerLock(locked: boolean) {
  useEffect(() => {
    const scrollElement =
      typeof document === "undefined"
        ? null
        : document.querySelector<HTMLElement>("[data-app-scroll-container]");

    if (!scrollElement || !locked) {
      return undefined;
    }

    const originalScrollLocked = scrollElement.dataset.scrollLocked;
    const originalScrollTop = scrollElement.scrollTop;
    scrollElement.dataset.scrollLocked = "true";

    return () => {
      if (originalScrollLocked) {
        scrollElement.dataset.scrollLocked = originalScrollLocked;
      } else {
        delete scrollElement.dataset.scrollLocked;
      }

      scrollElement.scrollTop = originalScrollTop;
    };
  }, [locked]);
}

function PopupCardExpandedMedia({ card }: { card: PopupCardItem }) {
  const expandedMedia = getExpandedMedia(card);
  const primaryExpandedMedia = getPrimaryExpandedMedia(card);
  const [shouldCycleExpandedMedia, setShouldCycleExpandedMedia] = useState(false);

  const supportsExpandedSequence =
    Array.isArray(expandedMedia) && expandedMedia.length > 1;
  const expandedSequenceMedia = supportsExpandedSequence
    ? expandedMedia.slice(1)
    : undefined;
  const shouldPromoteToExpandedSequence =
    shouldCycleExpandedMedia && Boolean(expandedSequenceMedia?.length);
  const visibleMedia = shouldPromoteToExpandedSequence
    ? expandedSequenceMedia
    : primaryExpandedMedia;

  if (!visibleMedia) {
    return null;
  }

  return (
    <motion.div
      className="popup-card-modal__visual"
      layoutId={getPopupCardVisualLayoutId(card.id)}
      transition={POPUP_CARD_LAYOUT_TRANSITION}
    >
      <PopupCardMediaRenderer
        asset={visibleMedia}
        cardId={shouldPromoteToExpandedSequence ? undefined : card.id}
        mode="expanded"
        className="popup-card-modal__media"
        fit="contain"
        shouldPlay
        playbackDelayMs={
          shouldPromoteToExpandedSequence
            ? 0
            : POPUP_CARD_EXPANDED_PLAYBACK_DELAY_MS
        }
        onEnded={
          supportsExpandedSequence && !shouldPromoteToExpandedSequence
            ? () => {
                setShouldCycleExpandedMedia(true);
              }
            : undefined
        }
        loop={!supportsExpandedSequence || shouldPromoteToExpandedSequence}
      />

      <div className="popup-card-modal__visual-overlay" aria-hidden="true" />
    </motion.div>
  );
}

function ExpandedCard({
  card,
  onClose,
  closeButtonRef,
}: {
  card: PopupCardItem;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  const expandedMedia = getExpandedMedia(card);

  return (
    <motion.article
      className={`popup-card-modal${expandedMedia ? "" : " popup-card-modal--text-only"}`}
      layoutId={`popup-card-${card.id}`}
      role="region"
      aria-labelledby={`popup-card-modal-title-${card.id}`}
      transition={POPUP_CARD_LAYOUT_TRANSITION}
    >
      {expandedMedia ? <PopupCardExpandedMedia card={card} /> : null}

      <div className="popup-card-modal__copy-wrapper">
        <div className="popup-card-modal__copy">
          <div className="popup-card-modal__toolbar">
            {card.eyebrow ? (
              <p className="popup-card-modal__eyebrow">{card.eyebrow}</p>
            ) : (
              <span />
            )}
            <button
              ref={closeButtonRef}
              type="button"
              className="popup-card-modal__close"
              onClick={onClose}
              aria-label={`Close ${card.title}`}
            >
              Close
            </button>
          </div>

          <div className="popup-card-modal__heading">
            <h3
              id={`popup-card-modal-title-${card.id}`}
              className="popup-card-modal__title"
            >
              {card.title}
            </h3>
            <p className="popup-card-modal__subtitle">{card.subtitle}</p>
          </div>

          <p className="popup-card-modal__description">{card.description}</p>

          {card.detailItems && card.detailItems.length > 0 ? (
            <div className="popup-card-modal__details">
              <p className="popup-card-modal__details-label">Focus areas</p>
              <ul className="popup-card-modal__details-list">
                {card.detailItems.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function PopupCardsDialog({
  card,
  onClose,
  portalTarget,
  prefersReducedMotion,
  closeButtonRef,
}: {
  card: PopupCardItem;
  onClose: () => void;
  portalTarget: HTMLElement;
  prefersReducedMotion: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  const overlayTransition = prefersReducedMotion
    ? { duration: 0 }
    : POPUP_CARD_LAYOUT_TRANSITION;

  return createPortal(
    <motion.div className="popup-cards__expanded-layer">
      <motion.button
        type="button"
        className="popup-cards__backdrop"
        aria-label={`Close ${card.title}`}
        onClick={onClose}
        initial={{ backdropFilter: "blur(0px)" }}
        animate={{ backdropFilter: "blur(12px)" }}
        exit={{ backdropFilter: "blur(0px)" }}
        transition={overlayTransition}
      >
        <motion.span
          className="popup-cards__backdrop-tint"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        />
      </motion.button>

      <motion.div
        className="popup-cards__expanded"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`popup-card-modal-title-${card.id}`}
        initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.992 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.996 }}
        transition={overlayTransition}
      >
        <ExpandedCard
          key={`expanded-${card.id}`}
          card={card}
          onClose={onClose}
          closeButtonRef={closeButtonRef}
        />
      </motion.div>
    </motion.div>,
    portalTarget,
  );
}

export const PopupCardsDialogController = memo(function PopupCardsDialogController({
  cardsById,
  prefersReducedMotion,
}: {
  cardsById: ReadonlyMap<string, PopupCardItem>;
  prefersReducedMotion: boolean;
}) {
  const store = usePopupCardsSelectionStore();
  const selectedCardId = useSelectedPopupCardId();
  const portalTarget = typeof document === "undefined" ? null : document.body;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectedCard = selectedCardId ? cardsById.get(selectedCardId) ?? null : null;

  const closeSelectedCard = useCallback(() => {
    store.closeCard();
  }, [store]);

  useEscapeToClose(Boolean(selectedCard), closeSelectedCard);
  useScrollContainerLock(Boolean(selectedCard));

  useEffect(() => {
    if (selectedCardId && !cardsById.has(selectedCardId)) {
      store.closeCard();
    }
  }, [cardsById, selectedCardId, store]);

  useEffect(() => {
    if (!selectedCard) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [selectedCard]);

  return (
    <AnimatePresence initial={false}>
      {selectedCard && portalTarget ? (
        <PopupCardsDialog
          card={selectedCard}
          onClose={closeSelectedCard}
          portalTarget={portalTarget}
          prefersReducedMotion={prefersReducedMotion}
          closeButtonRef={closeButtonRef}
        />
      ) : null}
    </AnimatePresence>
  );
});
