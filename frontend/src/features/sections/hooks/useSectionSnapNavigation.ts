import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";

const APP_SCROLL_CONTAINER_SELECTOR = "[data-app-scroll-container]";

type UseSectionSnapNavigationParams = {
  sectionCount: number;
};

type UseSectionSnapNavigationResult = {
  activeSectionIndex: number;
  handleSectionHeaderClick: (sectionIndex: number) => void;
  setSectionRef: (index: number, node: HTMLElement | null) => void;
};

function getClosestSectionIndex(
  scrollContainer: HTMLElement,
  sectionRefs: Array<HTMLElement | null>,
): number | null {
  const containerRect = scrollContainer.getBoundingClientRect();
  const containerCenter = containerRect.top + containerRect.height / 2;
  let closestIndex = -1;
  let closestDistance = Number.POSITIVE_INFINITY;

  sectionRefs.forEach((section, index) => {
    if (!section) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(sectionCenter - containerCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex >= 0 ? closestIndex : null;
}

export function useSectionSnapNavigation({
  sectionCount,
}: UseSectionSnapNavigationParams): UseSectionSnapNavigationResult {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const pendingSectionIndexRef = useRef<number | null>(null);
  const pendingSectionTimeoutRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const clearPendingSectionIndex = useCallback(() => {
    pendingSectionIndexRef.current = null;

    if (pendingSectionTimeoutRef.current !== null) {
      window.clearTimeout(pendingSectionTimeoutRef.current);
      pendingSectionTimeoutRef.current = null;
    }
  }, []);

  const setSectionRef = useCallback(
    (index: number, node: HTMLElement | null) => {
      sectionRefs.current[index] = node;
    },
    [],
  );

  const handleSectionHeaderClick = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= sectionCount) {
        return;
      }

      const targetSection = sectionRefs.current[sectionIndex];
      if (!targetSection) {
        return;
      }

      if (!prefersReducedMotion) {
        clearPendingSectionIndex();
        pendingSectionIndexRef.current = sectionIndex;
        pendingSectionTimeoutRef.current = window.setTimeout(() => {
          pendingSectionIndexRef.current = null;
          pendingSectionTimeoutRef.current = null;
        }, 2000);
      }

      setActiveSectionIndex(sectionIndex);
      targetSection.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [clearPendingSectionIndex, prefersReducedMotion, sectionCount],
  );

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sectionCount);

    if (
      pendingSectionIndexRef.current !== null &&
      pendingSectionIndexRef.current >= sectionCount
    ) {
      clearPendingSectionIndex();
    }
  }, [clearPendingSectionIndex, sectionCount]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const scrollContainer = document.querySelector<HTMLElement>(
      APP_SCROLL_CONTAINER_SELECTOR,
    );

    if (!scrollContainer) {
      return undefined;
    }

    let frameId: number | null = null;

    const syncActiveSectionIndex = () => {
      frameId = null;

      const nextIndex = getClosestSectionIndex(
        scrollContainer,
        sectionRefs.current,
      );

      if (nextIndex === null) {
        return;
      }

      const pendingSectionIndex = pendingSectionIndexRef.current;
      if (pendingSectionIndex !== null && nextIndex !== pendingSectionIndex) {
        setActiveSectionIndex((currentIndex) =>
          currentIndex === pendingSectionIndex
            ? currentIndex
            : pendingSectionIndex,
        );
        return;
      }

      if (pendingSectionIndex !== null) {
        clearPendingSectionIndex();
      }

      setActiveSectionIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex,
      );
    };

    const scheduleSync = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(syncActiveSectionIndex);
    };

    const releasePendingSectionOnUserScroll = () => {
      if (pendingSectionIndexRef.current === null) {
        return;
      }

      clearPendingSectionIndex();
      scheduleSync();
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleSync);
      resizeObserver.observe(scrollContainer);

      sectionRefs.current.forEach((section) => {
        if (section) {
          resizeObserver?.observe(section);
        }
      });
    }

    scheduleSync();
    scrollContainer.addEventListener("scroll", scheduleSync, { passive: true });
    scrollContainer.addEventListener("wheel", releasePendingSectionOnUserScroll, {
      passive: true,
    });
    scrollContainer.addEventListener(
      "touchstart",
      releasePendingSectionOnUserScroll,
      { passive: true },
    );
    window.addEventListener("resize", scheduleSync);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver?.disconnect();
      scrollContainer.removeEventListener("scroll", scheduleSync);
      scrollContainer.removeEventListener(
        "wheel",
        releasePendingSectionOnUserScroll,
      );
      scrollContainer.removeEventListener(
        "touchstart",
        releasePendingSectionOnUserScroll,
      );
      window.removeEventListener("resize", scheduleSync);
    };
  }, [clearPendingSectionIndex, sectionCount]);

  useEffect(() => clearPendingSectionIndex, [clearPendingSectionIndex]);

  const safeActiveSectionIndex = Math.min(
    activeSectionIndex,
    Math.max(sectionCount - 1, 0),
  );

  return {
    activeSectionIndex: safeActiveSectionIndex,
    handleSectionHeaderClick,
    setSectionRef,
  };
}
