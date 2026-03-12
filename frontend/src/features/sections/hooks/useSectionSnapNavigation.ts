import { useCallback, useEffect, useRef, useState } from "react";
import {
  AUTO_SCROLL_DURATION_MS,
  DOWN_VISIBLE_TRIGGER_RATIO,
  UP_VISIBLE_TRIGGER_RATIO,
} from "../constants/sections";
import type { SectionMetrics } from "../types/section";
import { findSectionIndexForPosition, getSectionMetrics, getSectionVisibleViewportRatio } from "../utils/sectionMetrics";

type UseSectionSnapNavigationParams = {
  sectionCount: number;
  autoSnapEnabled?: boolean;
};

type UseSectionSnapNavigationResult = {
  activeSectionIndex: number;
  furthestSectionIndex: number;
  isAutoSnapAvailable: boolean;
  handleSectionHeaderClick: (sectionIndex: number) => void;
  setSectionRef: (index: number, node: HTMLElement | null) => void;
};

const MIN_AUTO_SNAP_VIEWPORT_WIDTH = 960;
const MIN_AUTO_SNAP_VIEWPORT_HEIGHT = 820;
const MIN_AUTO_SCROLL_DURATION_MS = 620;
const MAX_AUTO_SCROLL_DURATION_MS = 1400;
const AUTO_SCROLL_DISTANCE_FACTOR_MS = 0.28;
const MIN_DIRECTION_DELTA_PX = 0.5;
const POSITION_EPSILON_PX = 1.5;
const MANUAL_SCROLL_SETTLE_BUFFER_MS = 220;
const SCROLL_BLOCKED_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "Space",
  " ",
  "Spacebar",
]);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getExpectedScrollDuration(distance: number): number {
  return clamp(
    AUTO_SCROLL_DURATION_MS + Math.abs(distance) * AUTO_SCROLL_DISTANCE_FACTOR_MS,
    MIN_AUTO_SCROLL_DURATION_MS,
    MAX_AUTO_SCROLL_DURATION_MS,
  );
}

function getIsAutoSnapAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.innerWidth >= MIN_AUTO_SNAP_VIEWPORT_WIDTH &&
    window.innerHeight >= MIN_AUTO_SNAP_VIEWPORT_HEIGHT &&
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function shouldUseReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useSectionSnapNavigation({
  sectionCount,
  autoSnapEnabled = true,
}: UseSectionSnapNavigationParams): UseSectionSnapNavigationResult {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [furthestSectionIndex, setFurthestSectionIndex] = useState(0);
  const [isAutoSnapAvailable, setIsAutoSnapAvailable] = useState(getIsAutoSnapAvailable);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const sectionMetricsRef = useRef<SectionMetrics[]>([]);
  const lastScrollYRef = useRef(0);
  const pendingScrollYRef = useRef(0);
  const isAutoScrollingRef = useRef(false);
  const isIndicatorLockedRef = useRef(false);
  const manualScrollTargetYRef = useRef<number | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const lockReleaseTimerRef = useRef<number | null>(null);
  const manualScrollLockTimerRef = useRef<number | null>(null);
  const effectiveAutoSnapEnabled = autoSnapEnabled && isAutoSnapAvailable;

  const refreshSectionMetrics = useCallback(() => {
    sectionMetricsRef.current = getSectionMetrics(sectionRefs.current);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
    if (lockReleaseTimerRef.current !== null) {
      window.clearTimeout(lockReleaseTimerRef.current);
      lockReleaseTimerRef.current = null;
    }
    isAutoScrollingRef.current = false;
  }, []);

  const clearManualScrollLock = useCallback(() => {
    if (manualScrollLockTimerRef.current !== null) {
      window.clearTimeout(manualScrollLockTimerRef.current);
      manualScrollLockTimerRef.current = null;
    }
    manualScrollTargetYRef.current = null;
  }, []);

  const updateActiveSectionIndex = useCallback((nextIndex: number) => {
    setActiveSectionIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
    setFurthestSectionIndex((currentIndex) => (currentIndex >= nextIndex ? currentIndex : nextIndex));
  }, []);

  const syncActiveSectionFromScrollY = useCallback((scrollY: number) => {
    const sections = sectionMetricsRef.current;
    const viewportHeight = window.innerHeight;
    if (sections.length === 0 || viewportHeight <= 0 || isIndicatorLockedRef.current) {
      return;
    }

    const nextIndex = findSectionIndexForPosition(sections, scrollY + viewportHeight * 0.5);
    updateActiveSectionIndex(nextIndex);
  }, [updateActiveSectionIndex]);

  const animateAutoScrollTo = useCallback(
    (targetY: number) => {
      stopAutoScroll();
      clearManualScrollLock();

      let startY = window.scrollY;
      let distance = targetY - startY;
      if (Math.abs(distance) <= POSITION_EPSILON_PX) {
        isIndicatorLockedRef.current = false;
        return;
      }

      const duration = clamp(
        AUTO_SCROLL_DURATION_MS + Math.abs(distance) * AUTO_SCROLL_DISTANCE_FACTOR_MS,
        MIN_AUTO_SCROLL_DURATION_MS,
        MAX_AUTO_SCROLL_DURATION_MS,
      );

      isAutoScrollingRef.current = true;
      if (lockReleaseTimerRef.current !== null) {
        window.clearTimeout(lockReleaseTimerRef.current);
      }
      lockReleaseTimerRef.current = window.setTimeout(() => {
        stopAutoScroll();
        isIndicatorLockedRef.current = false;
      }, duration + 420);
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (startTime === null) {
          startTime = timestamp;
          startY = window.scrollY;
          distance = targetY - startY;
          if (Math.abs(distance) <= POSITION_EPSILON_PX) {
            window.scrollTo(0, targetY);
            stopAutoScroll();
            isIndicatorLockedRef.current = false;
            lastScrollYRef.current = window.scrollY;
            syncActiveSectionFromScrollY(window.scrollY);
            return;
          }
        }

        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);
        const nextY = startY + distance * eased;
        window.scrollTo(0, nextY);

        if (t < 1) {
          autoScrollFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        window.scrollTo(0, targetY);
        stopAutoScroll();
        isIndicatorLockedRef.current = false;
        lastScrollYRef.current = window.scrollY;
        syncActiveSectionFromScrollY(window.scrollY);
      };

      autoScrollFrameRef.current = window.requestAnimationFrame(step);
    },
    [clearManualScrollLock, stopAutoScroll, syncActiveSectionFromScrollY],
  );

  const interruptAutoScroll = useCallback(() => {
    if (!isAutoScrollingRef.current && !isIndicatorLockedRef.current) {
      return;
    }

    stopAutoScroll();
    clearManualScrollLock();
    isIndicatorLockedRef.current = false;
    pendingScrollYRef.current = window.scrollY;
    lastScrollYRef.current = window.scrollY;
    syncActiveSectionFromScrollY(window.scrollY);
  }, [clearManualScrollLock, stopAutoScroll, syncActiveSectionFromScrollY]);

  const scrollToSection = useCallback((targetY: number) => {
    window.scrollTo({
      top: targetY,
      behavior: shouldUseReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  const startManualScrollLock = useCallback(
    (targetY: number) => {
      clearManualScrollLock();
      manualScrollTargetYRef.current = targetY;
      isIndicatorLockedRef.current = true;

      const duration = getExpectedScrollDuration(targetY - window.scrollY);
      manualScrollLockTimerRef.current = window.setTimeout(() => {
        clearManualScrollLock();
        isIndicatorLockedRef.current = false;
        syncActiveSectionFromScrollY(window.scrollY);
      }, duration + MANUAL_SCROLL_SETTLE_BUFFER_MS);
    },
    [clearManualScrollLock, syncActiveSectionFromScrollY],
  );

  const setSectionRef = useCallback(
    (index: number, node: HTMLElement | null) => {
      sectionRefs.current[index] = node;
      refreshSectionMetrics();
    },
    [refreshSectionMetrics],
  );

  const handleSectionHeaderClick = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= sectionCount) {
        isIndicatorLockedRef.current = false;
        return;
      }

      refreshSectionMetrics();
      const sections = sectionMetricsRef.current;
      const targetSection = sections[sectionIndex];
      if (!targetSection) {
        isIndicatorLockedRef.current = false;
        return;
      }

      updateActiveSectionIndex(sectionIndex);
      const targetTop = targetSection.top;

      if (Math.abs(targetTop - window.scrollY) <= POSITION_EPSILON_PX) {
        clearManualScrollLock();
        isIndicatorLockedRef.current = false;
        return;
      }

      if (effectiveAutoSnapEnabled) {
        isIndicatorLockedRef.current = true;
        animateAutoScrollTo(targetTop);
        return;
      }

      if (shouldUseReducedMotion()) {
        clearManualScrollLock();
        isIndicatorLockedRef.current = false;
        scrollToSection(targetTop);
        return;
      }

      startManualScrollLock(targetTop);
      scrollToSection(targetTop);
    },
    [
      animateAutoScrollTo,
      clearManualScrollLock,
      effectiveAutoSnapEnabled,
      refreshSectionMetrics,
      scrollToSection,
      sectionCount,
      startManualScrollLock,
      updateActiveSectionIndex,
    ],
  );

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sectionCount);
    refreshSectionMetrics();
  }, [refreshSectionMetrics, sectionCount]);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverQuery = window.matchMedia("(hover: hover)");
    const pointerQuery = window.matchMedia("(pointer: fine)");

    const syncAutoSnapAvailability = () => {
      setIsAutoSnapAvailable(getIsAutoSnapAvailable());
    };

    reduceMotionQuery.addEventListener("change", syncAutoSnapAvailability);
    hoverQuery.addEventListener("change", syncAutoSnapAvailability);
    pointerQuery.addEventListener("change", syncAutoSnapAvailability);
    window.addEventListener("resize", syncAutoSnapAvailability);
    syncAutoSnapAvailability();

    return () => {
      reduceMotionQuery.removeEventListener("change", syncAutoSnapAvailability);
      hoverQuery.removeEventListener("change", syncAutoSnapAvailability);
      pointerQuery.removeEventListener("change", syncAutoSnapAvailability);
      window.removeEventListener("resize", syncAutoSnapAvailability);
    };
  }, []);

  useEffect(() => {
    if (effectiveAutoSnapEnabled) {
      return;
    }

    stopAutoScroll();
    clearManualScrollLock();
    isIndicatorLockedRef.current = false;
    const currentY = window.scrollY;
    lastScrollYRef.current = currentY;
    pendingScrollYRef.current = currentY;
  }, [clearManualScrollLock, effectiveAutoSnapEnabled, stopAutoScroll]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    pendingScrollYRef.current = window.scrollY;

    const processScroll = () => {
      scrollFrameRef.current = null;

      const currentY = pendingScrollYRef.current;
      const viewportHeight = window.innerHeight;
      const sections = sectionMetricsRef.current;

      if (viewportHeight <= 0 || sections.length === 0) {
        return;
      }

      if (
        manualScrollTargetYRef.current !== null &&
        Math.abs(currentY - manualScrollTargetYRef.current) <= POSITION_EPSILON_PX + 2
      ) {
        clearManualScrollLock();
        isIndicatorLockedRef.current = false;
      }

      syncActiveSectionFromScrollY(currentY);

      if (isAutoScrollingRef.current) {
        lastScrollYRef.current = currentY;
        return;
      }

      if (!effectiveAutoSnapEnabled) {
        lastScrollYRef.current = currentY;
        return;
      }

      const deltaY = currentY - lastScrollYRef.current;
      if (Math.abs(deltaY) < MIN_DIRECTION_DELTA_PX) {
        return;
      }

      lastScrollYRef.current = currentY;
      const maxTargetIndex = sections.length - 1;
      const viewportTop = currentY;
      const viewportBottom = viewportTop + viewportHeight - 1;

      if (deltaY > 0) {
        const topSectionIndex = findSectionIndexForPosition(sections, viewportTop);
        if (topSectionIndex >= maxTargetIndex) {
          return;
        }

        const nextSection = sections[topSectionIndex + 1];
        const nextSectionVisibleRatio = getSectionVisibleViewportRatio(nextSection, viewportTop, viewportHeight);
        if (nextSectionVisibleRatio < DOWN_VISIBLE_TRIGGER_RATIO) {
          return;
        }

        const nextSectionIndex = topSectionIndex + 1;
        updateActiveSectionIndex(nextSectionIndex);
        isIndicatorLockedRef.current = true;
        animateAutoScrollTo(nextSection.top);
        return;
      }

      if (deltaY < 0) {
        const bottomSectionIndex = findSectionIndexForPosition(sections, viewportBottom);
        if (bottomSectionIndex <= 0) {
          return;
        }

        const previousSection = sections[bottomSectionIndex - 1];
        const previousSectionVisibleRatio = getSectionVisibleViewportRatio(previousSection, viewportTop, viewportHeight);
        if (previousSectionVisibleRatio < UP_VISIBLE_TRIGGER_RATIO) {
          return;
        }

        const targetTop = Math.max(0, previousSection.top + previousSection.height - viewportHeight);
        const previousSectionIndex = bottomSectionIndex - 1;
        updateActiveSectionIndex(previousSectionIndex);
        isIndicatorLockedRef.current = true;
        animateAutoScrollTo(targetTop);
      }
    };

    const onScroll = () => {
      pendingScrollYRef.current = window.scrollY;

      if (scrollFrameRef.current !== null) {
        return;
      }
      scrollFrameRef.current = window.requestAnimationFrame(processScroll);
    };

    const onUserScrollIntent = () => {
      interruptAutoScroll();
    };

    const onUserKeyDown = (event: KeyboardEvent) => {
      if (!SCROLL_BLOCKED_KEYS.has(event.key)) {
        return;
      }

      interruptAutoScroll();
    };

    const onResize = () => {
      refreshSectionMetrics();
      pendingScrollYRef.current = window.scrollY;
      lastScrollYRef.current = window.scrollY;
      if (scrollFrameRef.current === null) {
        scrollFrameRef.current = window.requestAnimationFrame(processScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onUserScrollIntent, { capture: true, passive: true });
    window.addEventListener("touchmove", onUserScrollIntent, { capture: true, passive: true });
    window.addEventListener("keydown", onUserKeyDown, { capture: true });
    window.addEventListener("resize", onResize);
    onResize();
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onUserScrollIntent, { capture: true });
      window.removeEventListener("touchmove", onUserScrollIntent, { capture: true });
      window.removeEventListener("keydown", onUserKeyDown, { capture: true });
      window.removeEventListener("resize", onResize);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
      stopAutoScroll();
      clearManualScrollLock();
      isIndicatorLockedRef.current = false;
    };
  }, [
    animateAutoScrollTo,
    clearManualScrollLock,
    effectiveAutoSnapEnabled,
    interruptAutoScroll,
    refreshSectionMetrics,
    stopAutoScroll,
    syncActiveSectionFromScrollY,
    updateActiveSectionIndex,
  ]);

  return {
    activeSectionIndex,
    furthestSectionIndex,
    isAutoSnapAvailable,
    handleSectionHeaderClick,
    setSectionRef,
  };
}
