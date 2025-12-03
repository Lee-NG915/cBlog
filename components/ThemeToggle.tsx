"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

// 月亮图标（夜晚模式）
const MoonIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

// 太阳图标（白天模式）
const SunIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 在未挂载时返回占位符，避免服务端渲染错误
  if (!mounted) {
    return (
      <button
        className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 dark:text-gray-300"
        aria-label="主题切换"
        disabled
      >
        <div className="relative w-5 h-5">
          <SunIcon />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
    >
      <div className="relative w-5 h-5">
        <span
          className={`absolute inset-0 transform transition-all duration-300 ${
            theme === "dark" ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
          }`}
        >
          <SunIcon />
        </span>
        <span
          className={`absolute inset-0 transform transition-all duration-300 ${
            theme === "light" ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"
          }`}
        >
          <MoonIcon />
        </span>
      </div>
    </button>
  );
}

