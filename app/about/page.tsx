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
      <header className="mb-8 border-b border-line-light pb-8 dark:border-line-dark">
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
          关于这个站点
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-normal text-ink dark:text-gray-50 sm:text-6xl">
          关于
        </h1>
      </header>
      <div className="prose rounded-3xl border border-line-light bg-surface-light p-8 dark:border-line-dark dark:bg-surface-dark">
        <p>这里记录产品判断、工程实践和长期学习中的可复盘经验。</p>
        <ul>
          <li>学习记录：基于数据、用户行为和业务目标形成的产品判断。</li>
          <li>工程札记：前端工程、部署实践、工具链和架构取舍。</li>
          <li>生活手记：日常观察、阅读笔记、兴趣和工作之外的生活记录。</li>
        </ul>
      </div>
    </div>
  );
}
