import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

export function useNarrowLayout(): boolean {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_BREAKPOINT).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return narrow;
}
