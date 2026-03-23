import { useEffect } from "react";
import type { PopupCardItem } from "../types/popupCards";
import {
  getPrimaryExpandedMedia,
  isVideoAsset,
  rememberAssetAspectRatio,
} from "../utils/popupCardMedia";

export function useExpandedMediaPreload(items: PopupCardItem[]) {
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const appendedLinks: HTMLLinkElement[] = [];
    const warmedVideos: HTMLVideoElement[] = [];
    const seenHrefs = new Set<string>();

    const appendImagePreloadLink = (href: string | undefined, type?: string) => {
      if (!href || seenHrefs.has(href)) {
        return;
      }

      seenHrefs.add(href);

      const existingLink = document.head.querySelector(
        `link[rel="preload"][href="${href}"]`,
      );
      if (existingLink) {
        return;
      }

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      if (type) {
        link.type = type;
      }
      document.head.appendChild(link);
      appendedLinks.push(link);
    };

    const warmVideoMetadata = (src: string | undefined) => {
      if (!src || seenHrefs.has(src)) {
        return;
      }

      seenHrefs.add(src);

      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => {
        const { videoWidth, videoHeight } = video;

        if (videoWidth > 0 && videoHeight > 0) {
          rememberAssetAspectRatio(src, videoWidth / videoHeight);
        }
      };
      video.src = src;
      video.load();
      warmedVideos.push(video);
    };

    items.forEach((item) => {
      const primaryExpandedMedia = getPrimaryExpandedMedia(item);

      if (!primaryExpandedMedia) {
        return;
      }

      if (isVideoAsset(primaryExpandedMedia)) {
        appendImagePreloadLink(primaryExpandedMedia.poster);
        warmVideoMetadata(primaryExpandedMedia.src);
        return;
      }

      appendImagePreloadLink(
        primaryExpandedMedia.src,
        primaryExpandedMedia.mimeType,
      );
    });

    return () => {
      appendedLinks.forEach((link) => {
        link.remove();
      });

      warmedVideos.forEach((video) => {
        video.onloadedmetadata = null;
        video.removeAttribute("src");
        video.load();
      });
    };
  }, [items]);
}
