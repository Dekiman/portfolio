import { useEffect } from "react";

const MIN_COARSE_WHEEL_DELTA_PX = 18;
const LINE_HEIGHT_PX = 16;
const PAGE_DELTA_RATIO = 0.9;
const SMOOTH_TIME_CONSTANT_MS = 42;
const MAX_FRAME_DELTA_MS = 34;
const STOP_EPSILON_PX = 0.35;
const TARGET_CATCH_UP_RATIO = 0.3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeWheelDelta(event: WheelEvent): number {
  switch (event.deltaMode) {
    case WheelEvent.DOM_DELTA_LINE:
      return event.deltaY * LINE_HEIGHT_PX;
    case WheelEvent.DOM_DELTA_PAGE:
      return event.deltaY * window.innerHeight * PAGE_DELTA_RATIO;
    default:
      return event.deltaY;
  }
}

function shouldUseSmoothWheel(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function shouldSmoothWheelEvent(event: WheelEvent): boolean {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return false;
  }

  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
    return false;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL && Math.abs(event.deltaY) < MIN_COARSE_WHEEL_DELTA_PX) {
    return false;
  }

  return true;
}

export function useSmoothWheelScroll(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    let frameId: number | null = null;
    let lastTimestamp = 0;
    let currentY = window.scrollY;
    let targetY = window.scrollY;

    const getMaxScrollY = () => Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

    const stopAnimation = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
      lastTimestamp = 0;
    };

    const step = (timestamp: number) => {
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      const deltaTime = Math.min(timestamp - lastTimestamp, MAX_FRAME_DELTA_MS);
      lastTimestamp = timestamp;

      const interpolation = 1 - Math.exp(-deltaTime / SMOOTH_TIME_CONSTANT_MS);
      currentY += (targetY - currentY) * interpolation;

      if (Math.abs(targetY - currentY) <= STOP_EPSILON_PX) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        stopAnimation();
        return;
      }

      window.scrollTo(0, currentY);
      frameId = window.requestAnimationFrame(step);
    };

    const startAnimation = () => {
      if (frameId !== null) {
        return;
      }

      currentY = window.scrollY;
      lastTimestamp = 0;
      frameId = window.requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent) => {
      if (!shouldUseSmoothWheel() || !shouldSmoothWheelEvent(event)) {
        return;
      }

      event.preventDefault();
      const wheelDelta = normalizeWheelDelta(event);
      const baseY = frameId === null ? window.scrollY : currentY + (targetY - currentY) * TARGET_CATCH_UP_RATIO;
      targetY = clamp(baseY + wheelDelta, 0, getMaxScrollY());
      startAnimation();
    };

    const onScroll = () => {
      if (frameId !== null) {
        return;
      }

      currentY = window.scrollY;
      targetY = window.scrollY;
    };

    const onResize = () => {
      targetY = clamp(targetY, 0, getMaxScrollY());
      if (frameId === null) {
        currentY = window.scrollY;
        targetY = currentY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      stopAnimation();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);
}
