import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "cBlog 管理台",
    template: "%s · cBlog 管理台",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-52 shrink-0 border-r border-slate-200 bg-slate-100 px-3 py-6">
            <p className="mb-6 px-3 text-base font-bold text-slate-800">
              cBlog 管理台
            </p>
            <AdminNav />
            <p className="mt-8 px-3 text-xs leading-5 text-slate-400">
              仅本地使用
              <br />
              前台预览请运行 pnpm dev:web
            </p>
          </aside>
          <main className="min-w-0 flex-1 px-8 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
