import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const description = "了解 Color 手记的内容方向：学习记录、工程札记和生活手记。";

export const metadata: Metadata = {
  title: "关于",
  description,
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    type: "website",
    url: "/about/",
    siteName: siteConfig.title,
    title: `关于 | ${siteConfig.title}`,
    description,
    locale: "zh_CN",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `关于 | ${siteConfig.title}`,
    description,
    images: [siteConfig.ogImage],
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8" data-reveal="hero">
        <p className="editorial-label">关于这个站点</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          关于
        </h1>
      </header>
      <div
        className="prose rounded-lg border border-line-light bg-surface-light p-8 shadow-editorial dark:border-line-dark dark:bg-surface-dark"
        data-reveal
      >
        <p>
          这里更像一本慢慢写的本子：学到哪记到哪，工程里踩过的坑、生活里的小事，偶尔翻回去看一眼。
        </p>
        <ul>
          <li>学习记录：最近在啃什么、怎么理解的、哪里还卡着。</li>
          <li>工程札记：写代码、部署、工具选用时的真实取舍。</li>
          <li>生活手记：工作以外的小事，不用包装，真实就好。</li>
        </ul>
        <p>
          这间站为什么长这样、样式怎么对应，写在{" "}
          <a href="/brand/">关于这间站</a>。
        </p>
      </div>
    </div>
  );
}
