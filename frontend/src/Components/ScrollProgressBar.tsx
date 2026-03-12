import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const fillNode = fillRef.current;
    if (!fillNode) {
      return undefined;
    }

    let frameId: number | null = null;
    let currentProgress = 0;
    let targetProgress = 0;

    const maxScrollableDistance = () =>
      Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );

    const readProgress = () => {
      const maxScroll = maxScrollableDistance();
      if (maxScroll <= 0) {
        return 0;
      }

      return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    const render = () => {
      fillNode.style.transform = `scaleY(${currentProgress})`;
    };

    const tick = () => {
      frameId = null;
      currentProgress += (targetProgress - currentProgress) * 0.18;

      if (Math.abs(targetProgress - currentProgress) <= 0.0015) {
        currentProgress = targetProgress;
      }

      render();

      if (currentProgress !== targetProgress) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const syncProgress = () => {
      targetProgress = readProgress();

      if (prefersReducedMotion) {
        currentProgress = targetProgress;
        render();
        return;
      }

      if (frameId === null) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    syncProgress();
    window.addEventListener("scroll", syncProgress, { passive: true });
    window.addEventListener("resize", syncProgress);

    return () => {
      window.removeEventListener("scroll", syncProgress);
      window.removeEventListener("resize", syncProgress);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress__track">
        <div ref={fillRef} className="scroll-progress__fill" />
      </div>
    </div>
  );
}
