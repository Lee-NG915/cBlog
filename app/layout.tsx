import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getAllCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: {
    default: "cBlog - 个人博客",
    template: "%s | cBlog",
  },
  description: "分享技术、生活、学习和旅行的点点滴滴",
  keywords: ["博客", "技术", "Next.js", "React", "前端"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = getAllCategories();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-[#fafafa] dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar categories={categories} />

            <div className="flex flex-col flex-1 lg:pl-64 min-h-screen">
              <MobileHeader categories={categories} />

              <main className="flex-1">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl">
                  {children}
                </div>
              </main>

              <Footer />
            </div>
          </div>
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
