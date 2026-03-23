import type {
  PopupCardElementSize,
  PopupCardItem,
  PopupCardMediaAsset,
  PopupCardMediaSource,
} from "../types/popupCards";

const popupCardMediaAspectRatioCache = new Map<string, number>();

function getPrimaryMediaAsset(
  asset?: PopupCardMediaSource,
): PopupCardMediaAsset | undefined {
  return Array.isArray(asset) ? asset[0] : asset;
}

export function getExpandedMedia(
  card: PopupCardItem,
): PopupCardMediaSource | undefined {
  return card.media?.expanded ?? card.media?.preview;
}

export function getPreviewMedia(
  card: PopupCardItem,
): PopupCardMediaAsset | undefined {
  return (
    getPrimaryMediaAsset(card.media?.preview) ??
    getPrimaryMediaAsset(getExpandedMedia(card))
  );
}

export function getPrimaryExpandedMedia(
  card: PopupCardItem,
): PopupCardMediaAsset | undefined {
  return getPrimaryMediaAsset(getExpandedMedia(card));
}

export function isVideoAsset(asset?: PopupCardMediaAsset): boolean {
  return Boolean(
    asset && (asset.kind === "video" || asset.mimeType?.startsWith("video/")),
  );
}

function getAssetAspectRatio(asset?: PopupCardMediaAsset): number | null {
  if (!asset?.width || !asset.height) {
    return null;
  }

  if (
    !Number.isFinite(asset.width) ||
    !Number.isFinite(asset.height) ||
    asset.width <= 0 ||
    asset.height <= 0
  ) {
    return null;
  }

  return asset.width / asset.height;
}

export function getKnownAssetAspectRatio(
  asset?: PopupCardMediaAsset,
): number | null {
  if (!asset) {
    return null;
  }

  return getAssetAspectRatio(asset) ?? popupCardMediaAspectRatioCache.get(asset.src) ?? null;
}

export function rememberAssetAspectRatio(src: string, aspectRatio: number) {
  if (!src || !Number.isFinite(aspectRatio) || aspectRatio <= 0) {
    return;
  }

  popupCardMediaAspectRatioCache.set(src, aspectRatio);
}

export function getContainedMediaFrame(
  container: PopupCardElementSize,
  aspectRatio: number,
): PopupCardElementSize | null {
  if (container.width <= 0 || container.height <= 0) {
    return null;
  }

  const containerRatio = container.width / container.height;

  if (containerRatio > aspectRatio) {
    return {
      width: container.height * aspectRatio,
      height: container.height,
    };
  }

  return {
    width: container.width,
    height: container.width / aspectRatio,
  };
}

export function getCoverScale(
  container: PopupCardElementSize,
  frame: PopupCardElementSize | null,
): number {
  if (
    !frame ||
    container.width <= 0 ||
    container.height <= 0 ||
    frame.width <= 0 ||
    frame.height <= 0
  ) {
    return 1;
  }

  return Math.max(container.width / frame.width, container.height / frame.height);
}

export function primePreviewVideoFrame(video: HTMLVideoElement) {
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
