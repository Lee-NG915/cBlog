import type { Metadata } from "next";
import Link from "next/link";
import BrandComponentShowcase from "@/components/brand/BrandComponentShowcase";
import { brandCore } from "@/lib/brand";
import { siteConfig } from "@/lib/site";

const description =
  "Color 手记长什么样、为什么这样写、样式和组件怎么对应——给自己和访客的说明页。";

export const metadata: Metadata = {
  title: "关于这间站",
  description,
  alternates: {
    canonical: "/brand/",
  },
  openGraph: {
    type: "website",
    url: "/brand/",
    siteName: siteConfig.title,
    title: `关于这间站 | ${siteConfig.title}`,
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
    title: `关于这间站 | ${siteConfig.title}`,
    description,
    images: [siteConfig.ogImage],
  },
};

const { page: copy } = brandCore;

export default function BrandPage() {
  return (
    <div className="pb-16">
      <header className="mb-12 lg:mb-16" data-reveal="hero">
        <p className="editorial-label">关于这间站</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.12] tracking-normal text-ink dark:text-gray-50 sm:text-5xl lg:text-6xl">
          {brandCore.tagline}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-base leading-8 text-ink-muted dark:text-gray-300 sm:text-lg">
          {copy.intro}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {brandCore.keywords.map((word) => (
            <span key={word} className="editorial-pill">
              {word}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
        <nav
          className="hidden lg:block"
          aria-label="本页目录"
          data-reveal
          data-reveal-delay="80"
        >
          <div className="sticky top-28 space-y-1">
            <p className="mb-3 font-sans text-xs text-ink-soft dark:text-gray-500">
              跳转到
            </p>
            {copy.toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-2 py-1.5 font-sans text-sm text-ink-muted transition hover:bg-primary-50/80 hover:text-primary-800 dark:text-gray-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-200"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-16 sm:space-y-20">
          <section id="essence" className="scroll-mt-28 space-y-5" data-reveal>
            <div>
              <p className="editorial-label">{copy.sections.essence.label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50">
                {copy.sections.essence.title}
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                {copy.sections.essence.lead}
              </p>
            </div>
            <div className="editorial-card p-6 sm:p-8">
              <p className="font-sans text-base leading-8 text-ink/90 dark:text-gray-300">
                <span className="font-display text-lg font-semibold text-ink dark:text-gray-100">
                  {brandCore.name}
                </span>
                {brandCore.essence}
              </p>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[440px] font-sans text-sm">
                  <thead>
                    <tr className="border-b border-line-light text-left dark:border-line-dark">
                      <th className="pb-2 pr-4 font-medium text-ink-muted">方面</th>
                      <th className="pb-2 pr-4 font-medium text-ink-muted">想靠近</th>
                      <th className="pb-2 font-medium text-ink-muted">尽量别</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandCore.personality.map((row) => (
                      <tr
                        key={row.axis}
                        className="border-b border-line-light/70 dark:border-line-dark/70"
                      >
                        <td className="py-3 pr-4 font-medium text-ink dark:text-gray-200">
                          {row.axis}
                        </td>
                        <td className="py-3 pr-4 text-ink-muted dark:text-gray-400">
                          {row.target}
                        </td>
                        <td className="py-3 text-ink-soft dark:text-gray-500">
                          {row.avoid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="pursuits" className="scroll-mt-28 space-y-5" data-reveal>
            <div>
              <p className="editorial-label">{copy.sections.pursuits.label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50">
                {copy.sections.pursuits.title}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {brandCore.pursuits.map((item, index) => (
                <article
                  key={item.title}
                  className="editorial-card p-6"
                  data-reveal
                  data-reveal-delay={(index % 2) * 80}
                >
                  <h3 className="font-display text-xl font-semibold text-ink dark:text-gray-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="pillars" className="scroll-mt-28 space-y-5" data-reveal>
            <div>
              <p className="editorial-label">{copy.sections.pillars.label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50">
                {copy.sections.pillars.title}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {brandCore.contentPillars.map((pillar, index) => (
                <article
                  key={pillar.slug}
                  className="editorial-card flex flex-col p-6"
                  data-reveal
                  data-reveal-delay={(index % 3) * 70}
                >
                  <h3 className="font-display text-xl font-semibold text-ink dark:text-gray-100">
                    {pillar.name}
                  </h3>
                  <p className="mt-2 flex-grow font-sans text-sm leading-6 text-ink-muted dark:text-gray-400">
                    {pillar.description}
                  </p>
                  <p className="mt-4 border-t border-line-light pt-4 font-sans text-xs text-ink-soft dark:border-line-dark dark:text-gray-500">
                    {pillar.tone}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="presentation" className="scroll-mt-28 space-y-5" data-reveal>
            <div>
              <p className="editorial-label">{copy.sections.presentation.label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50">
                {copy.sections.presentation.title}
              </h2>
            </div>
            <ul className="editorial-card space-y-4 p-6 sm:p-8">
              {brandCore.presentation.map((line) => (
                <li
                  key={line}
                  className="font-sans text-sm leading-7 text-ink/90 dark:text-gray-300"
                >
                  {line}
                </li>
              ))}
            </ul>
            <div className="editorial-card grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
              <div>
                <h3 className="font-sans text-sm font-medium text-ink dark:text-gray-100">
                  可以多用的词
                </h3>
                <p className="mt-2 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                  {brandCore.voice.use.join("、")}
                </p>
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium text-ink dark:text-gray-100">
                  尽量少用的词
                </h3>
                <p className="mt-2 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                  {brandCore.voice.avoid.join("、")}
                </p>
              </div>
              <p className="sm:col-span-2 font-sans text-xs leading-6 text-ink-soft dark:text-gray-500">
                {copy.sections.presentation.voiceHint}
              </p>
            </div>
          </section>

          <section id="design-system" className="scroll-mt-28 space-y-5" data-reveal>
            <div>
              <p className="editorial-label">{copy.sections.designSystem.label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50">
                {copy.sections.designSystem.title}
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                {copy.sections.designSystem.lead}
              </p>
            </div>
            <div className="editorial-card overflow-x-auto p-4 sm:p-6">
              <table className="w-full min-w-[640px] font-sans text-sm">
                <thead>
                  <tr className="border-b border-line-light text-left dark:border-line-dark">
                    <th className="pb-3 pr-3 font-medium text-ink-muted">感觉</th>
                    <th className="pb-3 pr-3 font-medium text-ink-muted">样式名</th>
                    <th className="pb-3 pr-3 font-medium text-ink-muted">参考</th>
                    <th className="pb-3 font-medium text-ink-muted">用在哪</th>
                  </tr>
                </thead>
                <tbody>
                  {brandCore.designSystemMapping.map((row) => (
                    <tr
                      key={row.token}
                      className="border-b border-line-light/70 dark:border-line-dark/70"
                    >
                      <td className="py-3 pr-3 text-ink dark:text-gray-200">
                        {row.brand}
                      </td>
                      <td className="py-3 pr-3 font-mono text-xs text-ink-muted dark:text-gray-400">
                        {row.token}
                      </td>
                      <td className="py-3 pr-3 text-ink-soft dark:text-gray-500">
                        {row.value}
                      </td>
                      <td className="py-3 text-ink-muted dark:text-gray-400">
                        {row.usage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-dashed border-line-strong bg-surface-strong/40 p-6 dark:border-line-dark dark:bg-surface-dark/40">
              <h3 className="font-sans text-sm font-medium text-ink dark:text-gray-100">
                {copy.sections.designSystem.checklistTitle}
              </h3>
              <ul className="mt-3 space-y-2.5 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                {copy.sections.designSystem.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                href="/"
                className="mt-5 inline-flex rounded-full border border-line-light bg-surface-light px-4 py-2 font-sans text-sm text-ink-muted transition hover:border-primary-300 hover:text-primary-800 dark:border-line-dark dark:bg-surface-dark dark:text-gray-300 dark:hover:text-primary-200"
              >
                {copy.sections.designSystem.backLink}
              </Link>
            </div>
          </section>

          <div className="border-t border-line-light pt-12 dark:border-line-dark">
            <header className="mb-10" data-reveal>
              <p className="editorial-label">{copy.sections.showcase.label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50 sm:text-4xl">
                {copy.sections.showcase.title}
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                {copy.sections.showcase.lead}
              </p>
            </header>
            <BrandComponentShowcase />
          </div>
        </div>
      </div>
    </div>
  );
}
