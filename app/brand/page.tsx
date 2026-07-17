import type { Metadata } from "next";
import Link from "next/link";
import BrandVisualPreview from "@/components/brand/BrandVisualPreview";
import { brandCore } from "@/lib/brand";
import { siteConfig } from "@/lib/site";

const description =
  "认识 Color 手记：一间慢慢写、慢慢读的小书房，以及作者如何看待学习、工程与生活记录。";

export const metadata: Metadata = {
  title: "关于我",
  description,
  alternates: {
    canonical: "/brand/",
  },
  openGraph: {
    type: "website",
    url: "/brand/",
    siteName: siteConfig.title,
    title: `关于我 | ${siteConfig.title}`,
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
    title: `关于我 | ${siteConfig.title}`,
    description,
    images: [siteConfig.ogImage],
  },
};

const { page: copy } = brandCore;

export default function BrandPage() {
  return (
    <div className="pb-16">
      <header className="mb-12 lg:mb-16" data-reveal="hero">
        <p className="editorial-label">关于我</p>
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

      <div className="grid gap-12 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-14">
        <nav
          className="hidden lg:block"
          aria-label="本页目录"
          data-reveal
          data-reveal-delay="80"
        >
          <div className="sticky top-28 space-y-1">
            <p className="mb-3 font-sans text-xs text-ink-soft dark:text-gray-500">
              目录
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
            <div className="editorial-card space-y-6 p-6 sm:p-8">
              <p className="font-sans text-base leading-8 text-ink/90 dark:text-gray-300">
                {brandCore.essence}
              </p>
              <div className="grid gap-x-8 gap-y-6 border-t border-line-light pt-6 dark:border-line-dark sm:grid-cols-2">
                {brandCore.personalityPublic.map((item) => (
                  <div key={item.title}>
                    <p className="font-sans text-xs font-medium text-primary-700 dark:text-primary-300">
                      {item.title}
                    </p>
                    <p className="mt-2 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="pursuits" className="scroll-mt-28 space-y-5" data-reveal>
            <div>
              <p className="editorial-label">{copy.sections.pursuits.label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50">
                {copy.sections.pursuits.title}
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                {copy.sections.pursuits.lead}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brandCore.pursuits.map((item, index) => (
                <article
                  key={item.title}
                  className="editorial-card p-6"
                  data-reveal
                  data-reveal-delay={(index % 3) * 70}
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
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                {copy.sections.pillars.lead}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {brandCore.contentPillars.map((pillar, index) => (
                <Link
                  key={pillar.slug}
                  href={`/categories/${pillar.slug}`}
                  className="editorial-card flex flex-col p-6 transition hover:border-primary-200 dark:hover:border-primary-800"
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
                </Link>
              ))}
            </div>
          </section>

          <section
            id="experience"
            className="scroll-mt-28 space-y-5"
            data-reveal
          >
            <div>
              <p className="editorial-label">
                {copy.sections.experience.label}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50">
                {copy.sections.experience.title}
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                {copy.sections.experience.lead}
              </p>
            </div>
            <ul className="editorial-card space-y-5 p-6 sm:p-8">
              {brandCore.readingExperience.map((line) => (
                <li
                  key={line}
                  className="font-sans text-base leading-8 text-ink/90 dark:text-gray-300"
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section className="scroll-mt-28 space-y-4" data-reveal>
            <div>
              <p className="editorial-label">{copy.sections.look.label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-gray-50">
                {copy.sections.look.title}
              </h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
                {copy.sections.look.lead}
              </p>
            </div>
            <BrandVisualPreview />
          </section>

          <footer
            className="border-t border-line-light pt-10 dark:border-line-dark"
            data-reveal
          >
            <p className="max-w-2xl font-sans text-base leading-8 text-ink-muted dark:text-gray-400">
              {copy.closing}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
