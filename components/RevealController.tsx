"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function revealIfVisible(item: HTMLElement, observer: IntersectionObserver) {
  const rect = item.getBoundingClientRect();
  const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

  if (inView) {
    item.classList.add("is-revealed");
    observer.unobserve(item);
  }
}

export default function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let frameId = 0;

    const setup = () => {
      const root = document.documentElement;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      const revealItems = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]"),
      );

      if (reducedMotion.matches) {
        root.classList.remove("reveal-ready");
        revealItems.forEach((item) => item.classList.add("is-revealed"));
        return;
      }

      root.classList.add("reveal-ready");

      revealItems.forEach((item) => {
        item.classList.remove("is-revealed");
        const delay = item.dataset.revealDelay;
        if (delay) {
          item.style.setProperty("--reveal-delay", `${delay}ms`);
        }
      });

      if (!("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-revealed"));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-revealed");
            observer?.unobserve(entry.target);
          });
        },
        {
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.01,
        },
      );

      revealItems.forEach((item) => {
        observer?.observe(item);
        revealIfVisible(item, observer!);
      });
    };

    frameId = requestAnimationFrame(setup);

    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
