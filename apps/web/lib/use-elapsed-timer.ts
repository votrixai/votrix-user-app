"use client";

import { useEffect, useRef, useState } from "react";

export function useElapsedTimer(active: boolean): string | null {
  const [display, setDisplay] = useState<string | null>(null);
  const startRef = useRef<number | null>(null);
  const finalRef = useRef<string | null>(null);

  useEffect(() => {
    if (active) {
      startRef.current = Date.now();
      finalRef.current = null;
      let rafId: number;
      let lastUpdate = 0;

      const tick = () => {
        const now = Date.now();
        if (now - lastUpdate >= 100) {
          lastUpdate = now;
          const elapsed = (now - startRef.current!) / 1000;
          setDisplay(formatElapsed(elapsed));
        }
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }

    if (startRef.current !== null && finalRef.current === null) {
      const elapsed = (Date.now() - startRef.current) / 1000;
      finalRef.current = formatElapsed(elapsed);
      setDisplay(finalRef.current);
    }
  }, [active]);

  return display;
}

function formatElapsed(seconds: number): string {
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}
