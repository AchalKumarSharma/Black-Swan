"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let lenis: Lenis | null = null;
    let animId: number | null = null;
    let cancelled = false;

    const isWorkspace = pathname?.startsWith("/workspace");

    function init() {
      if (cancelled) return;

      const wrapperElement = isWorkspace
        ? (document.getElementById("workspace-canvas-scroll") as HTMLElement | null)
        : undefined;

      if (isWorkspace && !wrapperElement) {
        animId = requestAnimationFrame(init);
        return;
      }

      lenis = new Lenis({
        wrapper: wrapperElement || window,
        content: wrapperElement ? (wrapperElement.firstElementChild as HTMLElement) : undefined,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        infinite: false,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        if (lenis) {
          lenis.raf(time);
          animId = requestAnimationFrame(raf);
        }
      }
      animId = requestAnimationFrame(raf);
    }

    init();

    return () => {
      cancelled = true;
      if (animId) cancelAnimationFrame(animId);
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, [pathname]);

  return <>{children}</>;
}
