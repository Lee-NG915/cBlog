import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的个人博客",
  description: "分享技术、生活、学习和旅行的点点滴滴",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
