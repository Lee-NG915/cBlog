"use client";

import { useEffect, useState } from "react";

function getReadingProgress(): number {
  const article = document.querySelector<HTMLElement>("[data-post-body]");
  if (!article) {
    return 0;
  }

  const rect = article.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const totalScrollable = Math.max(article.offsetHeight - viewportHeight * 0.45, 1);
  const consumed = Math.min(Math.max(viewportHeight * 0.3 - rect.top, 0), totalScrollable);

  return Math.min(consumed / totalScrollable, 1);
}

export default function PostReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setProgress(getReadingProgress());
    };

    const schedule = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div aria-hidden className="reading-progress-shell">
      <span
        className="reading-progress-bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
