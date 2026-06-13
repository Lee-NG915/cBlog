"use client";

import { useEffect, useState } from "react";
import type { PostHeading } from "@/lib/posts";

interface PostTableOfContentsProps {
  headings: PostHeading[];
  title?: string;
}

export default function PostTableOfContents({
  headings,
  title = "目录",
}: PostTableOfContentsProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headingElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0, 0.2, 0.6, 1],
      },
    );

    headingElements.forEach((element) => observer.observe(element));

    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#/, "");
      const hash = rawHash ? decodeURIComponent(rawHash) : "";
      if (hash) {
        setActiveId(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="文章目录"
      className="editorial-card space-y-4 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-300">
          {title}
        </p>
        <span className="font-sans text-xs text-ink-soft dark:text-gray-400">
          {headings.length} 节
        </span>
      </div>

      <ol className="space-y-1.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`toc-link ${isActive ? "toc-link-active" : ""} ${
                  heading.level === 3 ? "pl-4" : ""
                }`}
                aria-current={isActive ? "location" : undefined}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
