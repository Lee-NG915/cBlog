"use client";

import { useState } from "react";
import Link from "next/link";
import MobileDrawer from "./MobileDrawer";

interface MobileHeaderProps {
  categories: Array<{ name: string; count: number }>;
}

// 菜单图标
const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function MobileHeader({ categories }: MobileHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              cBlog
            </span>
          </Link>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="打开菜单"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
      />
    </>
  );
}

