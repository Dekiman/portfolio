import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type PopupCardMediaAsset = {
  kind: "video" | "gif" | "image";
  src: string;
  alt: string;
  poster?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

type PopupCardMedia = {
  preview?: PopupCardMediaAsset | PopupCardMediaAsset[];
  expanded?: PopupCardMediaAsset | PopupCardMediaAsset[];
};

export type PopupCardItem = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  description: string;
  detailItems?: string[];
  media?: PopupCardMedia;
  featured?: boolean;
};

type PopupCardsProps = {
  items: PopupCardItem[];
  ariaLabel: string;
};

const POPUP_CARD_TRANSITION = {
  type: "spring" as const,
  stiffness: 280,
  damping: 32,
  mass: 0.9,
};

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const supportsStableScrollbarGutter =
      typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("scrollbar-gutter: stable");
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (!supportsStableScrollbarGutter && scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [locked]);
}

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

function getExpandedMedia(card: PopupCardItem): PopupCardMediaAsset | PopupCardMediaAsset[] | undefined {
  return card.media?.expanded ?? card.media?.preview;
}

function getPreviewMedia(card: PopupCardItem): PopupCardMediaAsset | undefined {
  const preview = card.media?.preview;
  if (Array.isArray(preview)) {
    return preview[0];
  }
  if (preview) {
    return preview;
  }
  const expanded = getExpandedMedia(card);
  if (Array.isArray(expanded)) {
    return expanded[0];
  }
  return expanded;
}

function handlePreviewVideoLoaded(event: SyntheticEvent<HTMLVideoElement>) {
  const video = event.currentTarget;

  if (video.dataset.previewFrameReady === "true") {
    return;
  }

  video.dataset.previewFrameReady = "true";

  if (!Number.isFinite(video.duration) || video.duration <= 0.08) {
    return;
  }

  try {
    video.currentTime = 0.08;
  } catch {
    // Some browsers block seek attempts before enough data is ready.
  }
}

function handlePreviewVideoCanPlay(event: SyntheticEvent<HTMLVideoElement>) {
  const video = event.currentTarget;

  if (video.dataset.previewFrameReady === "true") {
    return;
  }

  video.dataset.previewFrameReady = "true";

  if (!Number.isFinite(video.duration) || video.duration <= 0.08) {
    return;
  }

  try {
    video.currentTime = 0.08;
  } catch {
    // Some browsers block seek attempts before enough data is ready.
  }
}

function isVideoAsset(asset?: PopupCardMediaAsset): boolean {
  return Boolean(asset && (asset.kind === "video" || asset.mimeType?.startsWith("video/")));
}

function PopupCardVideo({
  asset,
  className,
  shouldPlay,
  alt,
  mode,
  onEnded,
  loop = true,
}: {
  asset: PopupCardMediaAsset;
  className: string;
  shouldPlay: boolean;
  alt?: string;
  mode: "preview" | "expanded";
  onEnded?: () => void;
  loop?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    if (!shouldPlay) {
      video.pause();
      return undefined;
    }

    const startPlayback = async () => {
      try {
        video.currentTime = 0;
      } catch {
        // Ignore seek issues on browsers that gate this until enough data is ready.
      }

      try {
        await video.play();
      } catch {
        // Autoplay can still be blocked in some environments; the modal remains usable.
      }
    };

    void startPlayback();

    return () => {
      video.pause();
    };
  }, [shouldPlay, asset.src]);

  return (
    <video
      ref={videoRef}
      className={`${className} ${className}--video`}
      src={asset.src}
      poster={asset.poster}
      muted
      playsInline
      loop={loop && shouldPlay}
      autoPlay={shouldPlay}
      preload="metadata"
      aria-label={alt}
      aria-hidden={mode === "preview"}
      tabIndex={-1}
      onLoadedData={!shouldPlay ? handlePreviewVideoLoaded : undefined}
      onCanPlay={!shouldPlay ? handlePreviewVideoCanPlay : undefined}
      onEnded={onEnded}
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
      style={mode === "expanded" ? { objectFit: "contain", width: "100%", height: "100%" } : undefined}
    />
  );
}

function MediaRenderer({
  asset,
  mode,
  className,
  shouldPlay = false,
}: {
  asset?: PopupCardMediaAsset | PopupCardMediaAsset[];
  mode: "preview" | "expanded";
  className: string;
  shouldPlay?: boolean;
}) {
  if (!asset) {
    return <div className={`${className} ${className}--empty`} aria-hidden="true" />;
  }

  if (Array.isArray(asset)) {
    return (
      <CyclingMedia
        assets={asset}
        className={className}
        shouldPlay={shouldPlay}
        mode={mode}
      />
    );
  }

  if (isVideoAsset(asset)) {
    return (
      <PopupCardVideo
        asset={asset}
        className={className}
        shouldPlay={shouldPlay}
        alt={mode === "expanded" ? asset.alt : undefined}
        mode={mode}
      />
    );
  }

  return (
    <img
      className={`${className} ${className}--image`}
      src={asset.src}
      alt={mode === "expanded" ? asset.alt : ""}
      aria-hidden={mode === "preview"}
      loading={mode === "expanded" ? "eager" : "lazy"}
      draggable={false}
    />
  );
}

function CyclingMedia({
  assets,
  className,
  shouldPlay,
  mode,
}: {
  assets: PopupCardMediaAsset[];
  className: string;
  shouldPlay: boolean;
  mode: "preview" | "expanded";
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAsset = assets[currentIndex];

  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % assets.length);
  };

  if (!isVideoAsset(currentAsset)) {
    // For non-videos, just show the first one or cycle with timer
    return (
      <img
        className={`${className} ${className}--image`}
        src={currentAsset.src}
        alt={mode === "expanded" ? currentAsset.alt : ""}
        aria-hidden={mode === "preview"}
        loading={mode === "expanded" ? "eager" : "lazy"}
        draggable={false}
      />
    );
  }

  return (
    <PopupCardVideo
      asset={currentAsset}
      className={className}
      shouldPlay={shouldPlay}
      alt={mode === "expanded" ? currentAsset.alt : undefined}
      mode={mode}
      onEnded={handleVideoEnd}
      loop={false}
    />
  );
}

function FeaturedCardPreview({
  card,
  onOpen,
  prefersReducedMotion,
  isActive,
}: {
  card: PopupCardItem;
  onOpen: () => void;
  prefersReducedMotion: boolean;
  isActive: boolean;
}) {
  const previewMedia = getPreviewMedia(card);

  return (
    <motion.button
      type="button"
      className={`popup-card popup-card--featured${isActive ? " popup-card--selected" : ""}`}
      layoutId={`popup-card-${card.id}`}
      onClick={onOpen}
      aria-label={`Open personal project: ${card.title}`}
      aria-haspopup="dialog"
      whileHover={prefersReducedMotion || isActive ? undefined : { y: -4 }}
      whileTap={prefersReducedMotion || isActive ? undefined : { scale: 0.992 }}
      transition={POPUP_CARD_TRANSITION}
    >
      <div className="popup-card__visual popup-card__visual--featured">
        <MediaRenderer asset={previewMedia} mode="preview" className="popup-card__media" />
      </div>

      <motion.div className="popup-card__copy popup-card__copy--featured" layoutId={`popup-card-copy-${card.id}`}>
        {card.eyebrow ? <p className="popup-card__eyebrow">{card.eyebrow}</p> : null}

        <div className="popup-card__headline">
          <h3 className="popup-card__title popup-card__title--featured">{card.title}</h3>
          <p className="popup-card__subtitle popup-card__subtitle--featured">{card.subtitle}</p>
        </div>

        <p className="popup-card__summary">{card.description}</p>

        <span className="popup-card__action popup-card__action--featured" aria-hidden="true">
          Open notes
        </span>
      </motion.div>
    </motion.button>
  );
}

function GalleryCardPreview({
  card,
  onOpen,
  prefersReducedMotion,
  isActive,
}: {
  card: PopupCardItem;
  onOpen: () => void;
  prefersReducedMotion: boolean;
  isActive: boolean;
}) {
  const previewMedia = getPreviewMedia(card);

  return (
    <motion.button
      type="button"
      className={`popup-card popup-card--gallery${isActive ? " popup-card--selected" : ""}`}
      layoutId={`popup-card-${card.id}`}
      onClick={onOpen}
      aria-label={`Open personal project: ${card.title}`}
      aria-haspopup="dialog"
      whileHover={prefersReducedMotion || isActive ? undefined : { y: -3 }}
      whileTap={prefersReducedMotion || isActive ? undefined : { scale: 0.992 }}
      transition={POPUP_CARD_TRANSITION}
    >
      <div className="popup-card__visual popup-card__visual--gallery">
        <MediaRenderer asset={previewMedia} mode="preview" className="popup-card__media" />
      </div>

      <motion.div className="popup-card__copy popup-card__copy--gallery" layoutId={`popup-card-copy-${card.id}`}>
        {card.eyebrow ? <p className="popup-card__eyebrow popup-card__eyebrow--gallery">{card.eyebrow}</p> : null}

        <div className="popup-card__headline popup-card__headline--gallery">
          <h3 className="popup-card__title popup-card__title--gallery">{card.title}</h3>
          <p className="popup-card__subtitle popup-card__subtitle--gallery">{card.subtitle}</p>
        </div>

        <span className="popup-card__action popup-card__action--gallery" aria-hidden="true">
          Open build
        </span>
      </motion.div>
    </motion.button>
  );
}

function PopupCardsLayout({
  items,
  prefersReducedMotion,
  onOpen,
  activeCardId,
}: {
  items: PopupCardItem[];
  prefersReducedMotion: boolean;
  onOpen: (cardId: string) => void;
  activeCardId: string | null;
}) {
  const featuredCard = items.find((item) => item.featured) ?? items[0] ?? null;

  if (!featuredCard) {
    return null;
  }

  const galleryCards = items.filter((item) => item.id !== featuredCard.id);

  return (
    <section className="popup-cards__layout" aria-label="Project gallery">
      {galleryCards.length > 0 ? (
        <div className="popup-cards__gallery-header">
          <p className="popup-cards__gallery-label">Gallery</p>
          <p className="popup-cards__gallery-description">
            Personal builds exploring interface systems, realtime behavior, and application architecture.
          </p>
        </div>
      ) : null}

      <div
        className={`popup-cards__gallery-grid${galleryCards.length === 0 ? " popup-cards__gallery-grid--standalone" : ""}`}
      >
        <FeaturedCardPreview
          card={featuredCard}
          prefersReducedMotion={prefersReducedMotion}
          isActive={activeCardId === featuredCard.id}
          onOpen={() => {
            onOpen(featuredCard.id);
          }}
        />

        {galleryCards.map((card) => (
          <GalleryCardPreview
            key={card.id}
            card={card}
            prefersReducedMotion={prefersReducedMotion}
            isActive={activeCardId === card.id}
            onOpen={() => {
              onOpen(card.id);
            }}
          />
        ))}
      </div>
    </section>
  );
}

function ExpandedCard({
  card,
  onClose,
  prefersReducedMotion,
}: {
  card: PopupCardItem;
  onClose: () => void;
  prefersReducedMotion: boolean;
}) {
  const expandedMedia = getExpandedMedia(card);
  const shouldDelayExpandedPlayback = (Array.isArray(expandedMedia) ? expandedMedia.some(isVideoAsset) : isVideoAsset(expandedMedia)) && !prefersReducedMotion;
  const [shouldPlayExpandedMedia, setShouldPlayExpandedMedia] = useState(() => !shouldDelayExpandedPlayback);

  useEffect(() => {
    if (!shouldDelayExpandedPlayback) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShouldPlayExpandedMedia(true);
    }, 260);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shouldDelayExpandedPlayback]);

  const stopClose = (event: ReactPointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const modal = (
    <>
      <motion.div
        className="popup-cards__backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onPointerDown={onClose}
      />

      <motion.div
        className="popup-cards__modal-shell"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        onPointerDown={onClose}
      >
        <motion.article
          className={`popup-card-modal${expandedMedia ? "" : " popup-card-modal--text-only"}`}
          layoutId={`popup-card-${card.id}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`popup-card-modal-title-${card.id}`}
          transition={POPUP_CARD_TRANSITION}
          onPointerDown={stopClose}
        >
          {expandedMedia ? (
            <div className="popup-card-modal__visual">
              <MediaRenderer
                asset={expandedMedia}
                mode="expanded"
                className="popup-card-modal__media"
                shouldPlay={shouldPlayExpandedMedia}
              />
              <div className="popup-card-modal__visual-overlay" aria-hidden="true" />
            </div>
          ) : null}

          <div className="popup-card-modal__copy-wrapper">
            <motion.div 
              className="popup-card-modal__copy" 
              layoutId={`popup-card-copy-${card.id}`}
            >
              <div className="popup-card-modal__toolbar">
                {card.eyebrow ? <p className="popup-card-modal__eyebrow">{card.eyebrow}</p> : <span />}
                <button
                  type="button"
                  className="popup-card-modal__close"
                  onClick={onClose}
                  aria-label={`Close ${card.title}`}
                >
                  Close
                </button>
              </div>

              <div className="popup-card-modal__heading">
                <h3 id={`popup-card-modal-title-${card.id}`} className="popup-card-modal__title">
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
          </motion.div>          </div>        </motion.article>
      </motion.div>
    </>
  );

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(modal, document.body);
}

export function PopupCards({ items, ariaLabel }: PopupCardsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const selectedCard = items.find((item) => item.id === selectedCardId) ?? null;

  useLockBodyScroll(Boolean(selectedCard));
  useEscapeToClose(Boolean(selectedCard), () => {
    setSelectedCardId(null);
  });

  return (
    <LayoutGroup id="popup-cards">
      <section className="popup-cards" aria-label={ariaLabel}>
        <PopupCardsLayout
          items={items}
          prefersReducedMotion={prefersReducedMotion}
          activeCardId={selectedCardId}
          onOpen={(cardId) => {
            setSelectedCardId(cardId);
          }}
        />
      </section>

      <AnimatePresence initial={false}>
        {selectedCard ? (
          <ExpandedCard
            key={`expanded-${selectedCard.id}`}
            card={selectedCard}
            onClose={() => {
              setSelectedCardId(null);
            }}
            prefersReducedMotion={prefersReducedMotion}
          />
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
