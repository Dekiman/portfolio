import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { usePrefersReducedMotion } from "../../../../hooks/usePrefersReducedMotion";
import type {
  PopupCardElementSize,
  PopupCardMediaAsset,
  PopupCardMediaDisplayMode,
  PopupCardMediaFit,
  PopupCardMediaSource,
} from "../../types/popupCards";
import {
  getPopupCardMediaFrameLayoutId,
  POPUP_CARD_LAYOUT_TRANSITION,
} from "../../utils/popupCardLayout";
import {
  getContainedMediaFrame,
  getCoverScale,
  getKnownAssetAspectRatio,
  isVideoAsset,
  primePreviewVideoFrame,
  rememberAssetAspectRatio,
} from "../../utils/popupCardMedia";

const DEFAULT_MEDIA_ASPECT_RATIO = 16 / 9;

function useElementSize<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled = true,
): PopupCardElementSize {
  const [size, setSize] = useState<PopupCardElementSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((previousSize) =>
        previousSize.width === width && previousSize.height === height
          ? previousSize
          : { width, height },
      );
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabled, ref]);

  return size;
}

function PopupCardVideo({
  asset,
  className,
  alt,
  mode,
  fit,
  onEnded,
  ariaHidden,
  shouldPlay,
  playbackDelayMs = 0,
  onAspectRatioChange,
  loop = true,
}: {
  asset: PopupCardMediaAsset;
  className: string;
  alt?: string;
  mode: PopupCardMediaDisplayMode;
  fit: PopupCardMediaFit;
  onEnded?: () => void;
  ariaHidden?: boolean;
  shouldPlay: boolean;
  playbackDelayMs?: number;
  onAspectRatioChange?: (aspectRatio: number) => void;
  loop?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackDelayPendingRef = useRef(false);
  const playbackDelayTimerRef = useRef<number | null>(null);

  const startPlayback = useCallback(
    async (restart: boolean) => {
      const video = videoRef.current;

      if (!video || !shouldPlay) {
        return;
      }

      if (restart) {
        try {
          video.currentTime = 0;
        } catch {
          // Ignore seek issues on browsers that gate this until enough data is ready.
        }
      }

      try {
        await video.play();
      } catch {
        // Autoplay can still be blocked in some environments; the modal remains usable.
      }
    },
    [shouldPlay],
  );

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    if (playbackDelayTimerRef.current !== null) {
      window.clearTimeout(playbackDelayTimerRef.current);
      playbackDelayTimerRef.current = null;
    }

    if (!shouldPlay) {
      playbackDelayPendingRef.current = false;
      video.pause();

      if (
        mode === "preview" &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        primePreviewVideoFrame(video);
      }

      return undefined;
    }

    if (playbackDelayMs > 0) {
      playbackDelayPendingRef.current = true;
      playbackDelayTimerRef.current = window.setTimeout(() => {
        playbackDelayPendingRef.current = false;
        playbackDelayTimerRef.current = null;
        void startPlayback(true);
      }, playbackDelayMs);
    } else {
      playbackDelayPendingRef.current = false;
      void startPlayback(true);
    }

    return () => {
      if (playbackDelayTimerRef.current !== null) {
        window.clearTimeout(playbackDelayTimerRef.current);
        playbackDelayTimerRef.current = null;
      }

      playbackDelayPendingRef.current = false;
      video.pause();
    };
  }, [asset.src, mode, playbackDelayMs, shouldPlay, startPlayback]);

  return (
    <video
      ref={videoRef}
      className={`${className} ${className}--video`}
      src={asset.src}
      poster={asset.poster}
      muted
      playsInline
      loop={loop && shouldPlay}
      autoPlay={shouldPlay && playbackDelayMs <= 0}
      preload={mode === "expanded" || shouldPlay ? "auto" : "metadata"}
      aria-label={alt}
      aria-hidden={ariaHidden ?? mode === "preview"}
      tabIndex={-1}
      onLoadedMetadata={(event) => {
        const { videoWidth, videoHeight } = event.currentTarget;
        if (videoWidth > 0 && videoHeight > 0) {
          const aspectRatio = videoWidth / videoHeight;
          rememberAssetAspectRatio(asset.src, aspectRatio);
          onAspectRatioChange?.(aspectRatio);
        }

        if (shouldPlay && !playbackDelayPendingRef.current) {
          void startPlayback(false);
        }
      }}
      onLoadedData={(event) => {
        if (mode === "preview" && !shouldPlay) {
          primePreviewVideoFrame(event.currentTarget);
        }

        if (shouldPlay && !playbackDelayPendingRef.current) {
          void startPlayback(false);
        }
      }}
      onCanPlay={(event) => {
        if (mode === "preview" && !shouldPlay) {
          primePreviewVideoFrame(event.currentTarget);
        }

        if (shouldPlay && !playbackDelayPendingRef.current) {
          void startPlayback(false);
        }
      }}
      onEnded={onEnded}
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
      style={{ objectFit: fit, width: "100%", height: "100%" }}
    />
  );
}

function PopupCardVideoFrame({
  asset,
  className,
  mode,
  alt,
  shouldPlay,
  playbackDelayMs,
  ariaHidden,
  onEnded,
  fit,
  loop,
  layoutId,
}: {
  asset: PopupCardMediaAsset;
  className: string;
  mode: PopupCardMediaDisplayMode;
  alt?: string;
  shouldPlay: boolean;
  playbackDelayMs?: number;
  ariaHidden?: boolean;
  onEnded?: () => void;
  fit: PopupCardMediaFit;
  loop?: boolean;
  layoutId?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const isPreviewMode = mode === "preview";
  const viewportSize = useElementSize(viewportRef, isPreviewMode);
  const [measuredAspectRatio, setMeasuredAspectRatio] = useState<number | null>(
    () => getKnownAssetAspectRatio(asset),
  );
  const resolvedAspectRatio = measuredAspectRatio ?? DEFAULT_MEDIA_ASPECT_RATIO;
  const previewFrameSize = useMemo(
    () =>
      isPreviewMode
        ? getContainedMediaFrame(viewportSize, resolvedAspectRatio)
        : null,
    [isPreviewMode, resolvedAspectRatio, viewportSize],
  );
  const previewScale = isPreviewMode
    ? getCoverScale(viewportSize, previewFrameSize)
    : 1;
  const frameTransition = prefersReducedMotion
    ? { duration: 0 }
    : POPUP_CARD_LAYOUT_TRANSITION;
  const frameStyle =
    mode === "expanded"
      ? {
          width: "100%",
          height: "auto",
          aspectRatio: `${resolvedAspectRatio}`,
        }
      : {
          width: previewFrameSize ? `${previewFrameSize.width}px` : "100%",
          height: previewFrameSize ? `${previewFrameSize.height}px` : "100%",
        };

  return (
    <div
      ref={viewportRef}
      className={`${className}-viewport`}
      aria-hidden={ariaHidden ?? mode === "preview"}
    >
      <motion.div
        className={`${className}-frame`}
        layoutId={layoutId}
        transition={frameTransition}
        animate={{ scale: previewScale }}
        style={frameStyle}
      >
        <PopupCardVideo
          asset={asset}
          className={className}
          alt={alt}
          mode={mode}
          fit={mode === "expanded" || previewFrameSize ? "fill" : fit}
          ariaHidden={ariaHidden}
          shouldPlay={shouldPlay}
          playbackDelayMs={playbackDelayMs}
          onAspectRatioChange={(aspectRatio) => {
            setMeasuredAspectRatio((previousAspectRatio) =>
              previousAspectRatio === aspectRatio
                ? previousAspectRatio
                : aspectRatio,
            );
          }}
          onEnded={onEnded}
          loop={loop}
        />
      </motion.div>
    </div>
  );
}

function PopupCardImage({
  asset,
  className,
  mode,
  fit,
  ariaHidden,
}: {
  asset: PopupCardMediaAsset;
  className: string;
  mode: PopupCardMediaDisplayMode;
  fit: PopupCardMediaFit;
  ariaHidden?: boolean;
}) {
  return (
    <img
      className={`${className} ${className}--image`}
      src={asset.src}
      alt={mode === "expanded" ? asset.alt : ""}
      aria-hidden={ariaHidden ?? mode === "preview"}
      loading={mode === "expanded" ? "eager" : "lazy"}
      draggable={false}
      style={{ objectFit: fit }}
    />
  );
}

function CyclingMedia({
  assets,
  cardId,
  className,
  shouldPlay,
  mode,
  fit,
  playbackDelayMs,
  ariaHidden,
  onEnded,
  loop,
}: {
  assets: PopupCardMediaAsset[];
  cardId?: string;
  className: string;
  shouldPlay: boolean;
  mode: PopupCardMediaDisplayMode;
  fit: PopupCardMediaFit;
  playbackDelayMs?: number;
  ariaHidden?: boolean;
  onEnded?: () => void;
  loop?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const resolvedIndex = shouldPlay ? currentIndex : 0;
  const currentAsset = assets[resolvedIndex];

  if (!currentAsset) {
    return (
      <div className={`${className} ${className}--empty`} aria-hidden="true" />
    );
  }

  const handleVideoEnd = () => {
    onEnded?.();
    setCurrentIndex((previousIndex) => (previousIndex + 1) % assets.length);
  };

  if (!isVideoAsset(currentAsset)) {
    return (
      <PopupCardImage
        asset={currentAsset}
        className={className}
        mode={mode}
        fit={fit}
        ariaHidden={ariaHidden}
      />
    );
  }

  return (
    <PopupCardVideoFrame
      key={`${mode}-${currentAsset.src}`}
      asset={currentAsset}
      className={className}
      layoutId={
        resolvedIndex === 0 && cardId
          ? getPopupCardMediaFrameLayoutId(cardId)
          : undefined
      }
      alt={mode === "expanded" ? currentAsset.alt : undefined}
      mode={mode}
      fit={fit}
      shouldPlay={shouldPlay}
      playbackDelayMs={playbackDelayMs}
      onEnded={handleVideoEnd}
      ariaHidden={ariaHidden}
      loop={loop ?? false}
    />
  );
}

export function PopupCardMediaRenderer({
  asset,
  cardId,
  mode,
  className,
  shouldPlay = false,
  playbackDelayMs = 0,
  fit,
  ariaHidden,
  onEnded,
  loop,
}: {
  asset?: PopupCardMediaSource;
  cardId?: string;
  mode: PopupCardMediaDisplayMode;
  className: string;
  shouldPlay?: boolean;
  playbackDelayMs?: number;
  fit?: PopupCardMediaFit;
  ariaHidden?: boolean;
  onEnded?: () => void;
  loop?: boolean;
}) {
  const resolvedFit = fit ?? (mode === "expanded" ? "contain" : "cover");

  if (!asset) {
    return <div className={`${className} ${className}--empty`} aria-hidden="true" />;
  }

  if (Array.isArray(asset)) {
    return (
      <CyclingMedia
        key={`${mode}-${shouldPlay ? "live" : "static"}-${asset.map(({ src }) => src).join("|")}`}
        assets={asset}
        cardId={cardId}
        className={className}
        shouldPlay={shouldPlay}
        mode={mode}
        fit={resolvedFit}
        playbackDelayMs={playbackDelayMs}
        ariaHidden={ariaHidden}
        onEnded={onEnded}
        loop={loop}
      />
    );
  }

  if (isVideoAsset(asset)) {
    return (
      <PopupCardVideoFrame
        key={`${mode}-${asset.src}`}
        asset={asset}
        className={className}
        layoutId={cardId ? getPopupCardMediaFrameLayoutId(cardId) : undefined}
        alt={mode === "expanded" ? asset.alt : undefined}
        mode={mode}
        fit={resolvedFit}
        shouldPlay={shouldPlay}
        playbackDelayMs={playbackDelayMs}
        ariaHidden={ariaHidden}
        onEnded={onEnded}
        loop={loop}
      />
    );
  }

  return (
    <PopupCardImage
      asset={asset}
      className={className}
      mode={mode}
      fit={resolvedFit}
      ariaHidden={ariaHidden}
    />
  );
}
