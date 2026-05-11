import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getAllCategories } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 在服务端获取分类数据
  const categories = getAllCategories();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen min-w-[1180px] bg-[#f7f7f4] dark:bg-[#181818] text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar categories={categories} />

            <div className="flex flex-1 flex-col pl-72">
              <main className="flex-1">
                <div className="mx-auto w-full max-w-[1180px] px-10 py-10">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
