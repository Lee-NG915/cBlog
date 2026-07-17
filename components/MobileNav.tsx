"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavItems } from "@/lib/navigation";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // 路由变化后自动收起
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 点击面板外部时收起
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        type="button"
        aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line-light bg-surface-light text-ink-muted transition hover:border-primary-300 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-300 dark:hover:border-primary-700 dark:hover:text-primary-200"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <path d="M3 3l10 10" />
              <path d="M13 3L3 13" />
            </>
          ) : (
            <>
              <path d="M2 4.5h12" />
              <path d="M2 8h12" />
              <path d="M2 11.5h12" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <nav
          aria-label="移动端导航"
          className="absolute right-0 top-12 z-30 w-44 rounded-lg border border-line-light bg-surface-light p-2 shadow-editorial dark:border-line-dark dark:bg-surface-dark"
        >
          {mainNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-md px-3 py-2.5 font-sans text-sm transition ${
                  isActive
                    ? "bg-primary-50 font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
                    : "text-ink-muted hover:bg-background-light hover:text-primary-800 dark:text-gray-300 dark:hover:bg-background-dark dark:hover:text-primary-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
