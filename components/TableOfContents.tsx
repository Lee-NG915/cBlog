"use client";

import { useEffect, useState } from "react";
import { TocItem } from "@/lib/posts";

interface TableOfContentsProps {
  toc: TocItem[];
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-8 w-64 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        目录
      </h3>
      <ul className="space-y-1 text-sm border-l-2 border-gray-200 dark:border-gray-700">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveId(item.id);
                }
              }}
              className={`block py-1.5 border-l-2 -ml-[2px] transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400 ${
                item.level === 2 ? "pl-4" : item.level === 3 ? "pl-7" : "pl-10"
              } ${
                activeId === item.id
                  ? "border-primary-500 text-primary-600 dark:text-primary-400 font-medium"
                  : "border-transparent text-gray-600 dark:text-gray-400"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
