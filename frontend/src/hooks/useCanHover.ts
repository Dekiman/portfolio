import { useEffect, useState } from "react";

const CAN_HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function getInitialHoverCapability(): boolean {
  return typeof window !== "undefined" && window.matchMedia(CAN_HOVER_QUERY).matches;
}

export function useCanHover(): boolean {
  const [canHover, setCanHover] = useState(getInitialHoverCapability);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(CAN_HOVER_QUERY);
    const syncCapability = () => {
      setCanHover(mediaQuery.matches);
    };

    syncCapability();
    mediaQuery.addEventListener("change", syncCapability);

    return () => {
      mediaQuery.removeEventListener("change", syncCapability);
    };
  }, []);

  return canHover;
}
