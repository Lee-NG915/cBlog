"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { userProfile, mainNavItems, socialLinks, projectLinks } from "@/lib/navigation";

// 图标组件（与Sidebar相同）
const HomeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UserIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const FolderIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const MailIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ name: string; count: number }>;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  categories,
}: MobileDrawerProps) {
  const pathname = usePathname();

  // 当路由变化时关闭抽屉
  // useEffect(() => {
  //   onClose();
  // }, [pathname, onClose]);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "home":
        return <HomeIcon />;
      case "user":
        return <UserIcon />;
      case "folder":
        return <FolderIcon />;
      default:
        return null;
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 抽屉 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center space-x-3" onClick={onClose}>
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.nickname || "Avatar"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {(userProfile.nickname || userProfile.name || "U")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {userProfile.nickname || userProfile.name || "Blog"}
                </p>
                {userProfile.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userProfile.email}
                  </p>
                )}
              </div>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="关闭菜单"
            >
              <CloseIcon />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {/* 主导航 */}
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {getIcon(item.icon)}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}

            {/* 博客分类 */}
            {categories.length > 0 && (
              <>
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    博客导航
                  </h3>
                </div>
                {categories.map((category) => {
                  const categoryHref = `/categories/${encodeURIComponent(category.name)}`;
                  return (
                    <Link
                      key={category.name}
                      href={categoryHref}
                      onClick={onClose}
                      className={`flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
                        isActive(categoryHref)
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="flex items-center">
                        <FolderIcon />
                        <span className="ml-3">{category.name}</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {category.count}
                      </span>
                    </Link>
                  );
                })}
              </>
            )}

            {/* 项目链接 */}
            {projectLinks.length > 0 && (
              <>
                <div className="px-4 py-2 mt-4">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    项目
                  </h3>
                </div>
                {projectLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {getIcon(item.icon)}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* 社交链接 */}
          {socialLinks.length > 0 && (
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {socialLinks.map((link) => {
                  if (link.icon === "github") {
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={link.label}
                      >
                        <GitHubIcon />
                      </a>
                    );
                  }
                  if (link.icon === "email" || link.icon === "mail") {
                    return (
                      <a
                        key={link.href}
                        href={`mailto:${link.href}`}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={link.label}
                      >
                        <MailIcon />
                      </a>
                    );
                  }
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
                      aria-label={link.label}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

