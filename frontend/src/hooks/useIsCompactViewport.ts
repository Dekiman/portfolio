import { useEffect, useState } from "react";

const COMPACT_VIEWPORT_QUERY = "(max-width: 800px)";

function getInitialIsCompactViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia(COMPACT_VIEWPORT_QUERY).matches;
}

export function useIsCompactViewport(): boolean {
  const [isCompactViewport, setIsCompactViewport] = useState(getInitialIsCompactViewport);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(COMPACT_VIEWPORT_QUERY);
    const syncViewport = () => {
      setIsCompactViewport(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  return isCompactViewport;
}
