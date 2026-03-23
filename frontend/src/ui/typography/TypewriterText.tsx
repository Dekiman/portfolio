import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type TypewriterTextProps = {
  text: string;
  className?: string;
  characterDelay?: number;
  initialDelay?: number;
  showCursor?: boolean;
  cursorClassName?: string;
};

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function TypewriterText({
  text,
  className,
  characterDelay = 0.035,
  initialDelay = 0,
  showCursor = true,
  cursorClassName,
}: TypewriterTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const lineRef = useRef<HTMLSpanElement | null>(null);
  const totalCharacters = Array.from(text).length;

  useEffect(() => {
    const lineNode = lineRef.current;
    if (!lineNode) {
      return undefined;
    }

    const characters = Array.from(text);

    if (prefersReducedMotion) {
      lineNode.textContent = text;
      return undefined;
    }

    lineNode.textContent = "";
    if (totalCharacters === 0) {
      return undefined;
    }

    const timeouts: number[] = [];
    const initialTimeout = window.setTimeout(() => {
      lineNode.textContent = characters.slice(0, 1).join("");

      for (let index = 1; index < totalCharacters; index += 1) {
        const revealTimeout = window.setTimeout(() => {
          lineNode.textContent = characters.slice(0, index + 1).join("");
        }, index * characterDelay * 1000);
        timeouts.push(revealTimeout);
      }
    }, initialDelay * 1000);

    timeouts.push(initialTimeout);

    return () => {
      timeouts.forEach((timeout) => {
        window.clearTimeout(timeout);
      });
    };
  }, [characterDelay, initialDelay, prefersReducedMotion, text, totalCharacters]);

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const cursorStyle = {
    "--cursor-delay": `${initialDelay + totalCharacters * characterDelay}s`,
  } as CSSProperties;

  return (
    <span className={joinClassNames("typewriter-text", className)} aria-label={text}>
      <span ref={lineRef} className="typewriter-text__line" aria-hidden="true" />
      {showCursor ? (
        <span
          className={joinClassNames("typewriter-text__cursor", cursorClassName)}
          aria-hidden="true"
          style={cursorStyle}
        />
      ) : null}
    </span>
  );
}
