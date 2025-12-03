import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { getAllCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: "cBlog",
  description: "分享技术、生活、学习和旅行的点点滴滴",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 在服务端获取分类数据
  const categories = getAllCategories();

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <Sidebar categories={categories} />

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 lg:pl-64">
            {/* Mobile Header */}
            <MobileHeader categories={categories} />

            {/* Main Content */}
            <main className="flex-1">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
