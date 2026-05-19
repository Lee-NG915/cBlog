import EssayListItem from "@/components/EssayListItem";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import ReadingPathCard from "@/components/ReadingPathCard";
import ThemeToggle from "@/components/ThemeToggle";
import { brandCore } from "@/lib/brand";
import { showcaseCategory, showcasePost, showcasePosts } from "@/lib/brand-showcase";
import ShowcaseSandbox from "./ShowcaseSandbox";
import ShowcaseSection, { ShowcasePanel } from "./ShowcaseSection";

const colorSwatches = [
  { name: "浅底", token: "background-light", className: "bg-background-light" },
  { name: "深底", token: "background-dark", className: "bg-background-dark" },
  { name: "墨", token: "ink", className: "bg-ink" },
  { name: "陶土", token: "primary-500", className: "bg-primary-500" },
  { name: "鼠尾草", token: "accent-sage", className: "bg-accent-sage" },
  { name: "青蓝", token: "accent-blue", className: "bg-accent-blue" },
  { name: "金", token: "accent-gold", className: "bg-accent-gold" },
  { name: "线", token: "line-light", className: "bg-line-light" },
];

const componentInventory = [
  { name: "顶栏", usage: "站点导航与入口" },
  { name: "明暗切换", usage: "浅色 / 深色主题" },
  { name: "滚动淡入", usage: "区块进入视口时轻轻出现" },
  { name: "文章卡片", usage: "列表里的单篇预览" },
  { name: "精选大卡", usage: "首页主推一篇" },
  { name: "列表一行", usage: "紧凑的标题列表" },
  { name: "分类入口卡", usage: "按主题翻文章" },
  { name: "返回", usage: "从文章回到上一级" },
  { name: "正文图表", usage: "文内 Mermaid 图" },
  { name: "侧栏", usage: "预留，暂未启用" },
];

function ComponentCaption({ label }: { label: string }) {
  return (
    <p className="mb-4 font-sans text-sm text-ink-soft dark:text-gray-500">{label}</p>
  );
}

export default function BrandComponentShowcase() {
  return (
    <div className="space-y-20 sm:space-y-24">
      <ShowcaseSection
        id="inventory"
        label="清单"
        title="项目里有哪些组件"
        description="改样式前可以先瞄一眼，避免重复造轮子。"
      >
        <ShowcasePanel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] font-sans text-sm">
              <thead>
                <tr className="border-b border-line-light text-left dark:border-line-dark">
                  <th className="pb-3 pr-4 font-medium text-ink-muted">块</th>
                  <th className="pb-3 font-medium text-ink-muted">干什么用</th>
                </tr>
              </thead>
              <tbody>
                {componentInventory.map((item) => (
                  <tr
                    key={item.name}
                    className="border-b border-line-light/70 dark:border-line-dark/70"
                  >
                    <td className="py-3 pr-4 font-medium text-ink dark:text-gray-200">
                      {item.name}
                    </td>
                    <td className="py-3 text-ink-muted dark:text-gray-400">
                      {item.usage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-sans text-xs leading-6 text-ink-soft dark:text-gray-500">
            另外还有全局类：editorial-card、editorial-label、editorial-pill、prose，下面各节有样子。
          </p>
        </ShowcasePanel>
      </ShowcaseSection>

      <ShowcaseSection
        id="tokens"
        label="颜色与字"
        title="配色和字体"
        description="全站共用这一套配色和字体。"
      >
        <ShowcasePanel>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {colorSwatches.map((swatch) => (
              <div key={swatch.token} className="space-y-2">
                <div
                  className={`h-16 rounded-lg border border-line-light dark:border-line-dark ${swatch.className}`}
                />
                <p className="font-sans text-sm text-ink dark:text-gray-200">{swatch.name}</p>
                <p className="font-mono text-xs text-ink-soft dark:text-gray-500">
                  {swatch.token}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 space-y-4 border-t border-line-light pt-8 dark:border-line-dark">
            <p className="font-display text-3xl font-semibold text-ink dark:text-gray-50">
              标题用 Noto Serif SC
            </p>
            <p className="font-sans text-base leading-8 text-ink-muted dark:text-gray-300">
              按钮、日期、导航用 Noto Sans SC。正文在 prose 里是衬线，行距偏宽，适合长文。
            </p>
            <p className="font-serif text-lg leading-relaxed text-ink/90 dark:text-gray-300">
              比方说：周末在书店翻了一半的书，回家路上还在想某一页——这种句子适合放在正文里读。
            </p>
            <p className="editorial-label">小标题标签</p>
          </div>
        </ShowcasePanel>
      </ShowcaseSection>

      <ShowcaseSection
        id="layout"
        label="顶栏"
        title="顶栏和出现方式"
        description="进来时轻一点，别抢正文的注意力。"
      >
        <div className="space-y-6">
          <ShowcasePanel>
            <ComponentCaption label="顶栏" />
            <div className="overflow-hidden rounded-lg border border-line-light dark:border-line-dark">
              <div className="flex h-16 items-center justify-between gap-3 border-b border-line-light bg-background-light/88 px-5 backdrop-blur-md dark:border-line-dark dark:bg-background-dark/90">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-sans text-sm font-bold text-background-light dark:bg-gray-100 dark:text-gray-950">
                    C
                  </span>
                  <span className="font-sans text-sm font-semibold text-ink dark:text-gray-100">
                    Color
                  </span>
                </div>
                <nav className="hidden gap-6 font-sans text-sm text-ink-muted md:flex dark:text-gray-400">
                  <span>首页</span>
                  <span>路径</span>
                  <span>关于站</span>
                </nav>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent-sage px-4 py-2 font-sans text-xs font-semibold text-white">
                    开始阅读
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </ShowcasePanel>

          <ShowcasePanel>
            <ComponentCaption label="滚动淡入" />
            <p className="mb-4 font-sans text-sm leading-7 text-ink-muted dark:text-gray-400">
              区块带上 data-reveal，滚到眼前时再淡入。换页面后会重新绑一次。
            </p>
            <div
              className="rounded-lg border border-dashed border-primary-200 bg-primary-50/50 p-8 text-center dark:border-primary-800 dark:bg-primary-900/20"
              data-reveal
              data-reveal-delay="80"
            >
              <p className="font-sans text-sm text-primary-800 dark:text-primary-200">
                像这样轻轻浮上来
              </p>
            </div>
          </ShowcasePanel>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        id="actions"
        label="按钮"
        title="按钮和标签"
        description="主按钮低调一点，悬停别跳。"
      >
        <ShowcasePanel>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-background-light dark:bg-gray-100 dark:text-gray-950">
              实心按钮
            </span>
            <span className="rounded-full border border-line-light bg-surface-light px-5 py-2.5 font-sans text-sm font-semibold text-ink dark:border-line-dark dark:bg-surface-dark dark:text-gray-200">
              线框按钮
            </span>
            <span className="rounded-full bg-accent-sage px-5 py-2.5 font-sans text-sm font-semibold text-white">
              开始阅读
            </span>
          </div>
          <nav className="mt-8 flex flex-wrap gap-2 font-sans">
            <span className="rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800 ring-1 ring-primary-100 dark:bg-primary-900/30 dark:text-primary-200 dark:ring-primary-800">
              当前页
            </span>
            <span className="rounded-full border border-line-light bg-surface-light px-4 py-2 text-sm text-ink-muted dark:border-line-dark dark:bg-surface-dark dark:text-gray-300">
              学习记录
            </span>
            <span className="editorial-pill">标签</span>
          </nav>
          <div className="mt-8">
            <ComponentCaption label="返回" />
            <ShowcaseSandbox>
              <div className="mb-6 inline-flex">
                <span className="inline-flex items-center space-x-2 rounded-full border border-line-light bg-surface-light px-4 py-2 font-sans text-sm font-semibold text-ink-muted shadow-editorial-sm dark:border-line-dark dark:bg-surface-dark dark:text-gray-300">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>返回首页</span>
                </span>
              </div>
            </ShowcaseSandbox>
          </div>
        </ShowcasePanel>
      </ShowcaseSection>

      <ShowcaseSection
        id="content"
        label="卡片"
        title="文章和分类卡片"
        description="首页、列表页最常见的就是这些。"
      >
        <div className="space-y-10">
          <div>
            <ComponentCaption label="精选大卡" />
            <ShowcaseSandbox>
              <FeaturedPost post={showcasePost} revealDelay={0} />
            </ShowcaseSandbox>
          </div>

          <div>
            <ComponentCaption label="文章卡片" />
            <ShowcaseSandbox>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {showcasePosts.map((post, index) => (
                  <PostCard key={post.slug} post={post} revealDelay={index * 60} />
                ))}
              </div>
            </ShowcaseSandbox>
          </div>

          <ShowcasePanel>
            <ComponentCaption label="列表一行" />
            <ShowcaseSandbox>
              <EssayListItem post={showcasePost} />
            </ShowcaseSandbox>
          </ShowcasePanel>

          <div className="max-w-md">
            <ComponentCaption label="分类入口卡" />
            <ShowcaseSandbox>
              <ReadingPathCard category={showcaseCategory} latestPost={showcasePost} />
            </ShowcaseSandbox>
          </div>

          <ShowcasePanel>
            <ComponentCaption label="分类页卡片" />
            <ShowcaseSandbox>
              <div className="block rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial-sm dark:border-line-dark dark:bg-surface-dark">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-ink dark:text-gray-50">
                      {showcaseCategory.name}
                    </h3>
                    <p className="mt-2 font-sans text-sm leading-6 text-ink-muted dark:text-gray-300">
                      {showcaseCategory.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 font-sans text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                    {showcaseCategory.count}
                  </span>
                </div>
              </div>
            </ShowcaseSandbox>
          </ShowcasePanel>

          <ShowcasePanel>
            <ComponentCaption label="首页侧边统计" />
            <p className="editorial-label">概览</p>
            <div className="mt-4 grid grid-cols-2 gap-6 font-sans">
              <div>
                <p className="text-xs text-ink-soft dark:text-gray-500">文章</p>
                <p className="mt-1 text-3xl font-semibold text-ink dark:text-gray-100">24</p>
              </div>
              <div>
                <p className="text-xs text-ink-soft dark:text-gray-500">主题</p>
                <p className="mt-1 text-3xl font-semibold text-ink dark:text-gray-100">3</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["笔记", "复盘", "慢慢来"].map((tag) => (
                <span key={tag} className="editorial-pill">
                  {tag}
                </span>
              ))}
            </div>
          </ShowcasePanel>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        id="article"
        label="文章页"
        title="读文章时的样子"
        description="标题、正文、侧栏，和真实文章页同一套。"
      >
        <ShowcasePanel className="space-y-8">
          <ShowcaseSandbox className="space-y-8">
            <header>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary-50 px-4 py-2 font-sans text-sm font-semibold text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                  学习记录
                </span>
                <span className="font-sans text-sm text-ink-muted dark:text-gray-400">
                  大约 6 分钟
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold leading-tight text-ink dark:text-gray-50 sm:text-5xl">
                一篇还没写完的笔记
              </h1>
              <p className="mt-4 font-sans text-sm text-ink-soft dark:text-gray-500">
                记录于 2026.05.19
              </p>
            </header>

            <div className="prose rounded-lg border border-line-light bg-surface-light p-6 dark:border-line-dark dark:bg-surface-dark sm:p-8">
              <h2>小标题</h2>
              <p>
                正文行距比较宽，可以一直读下去。链接是
                <span className="text-accent-blue underline decoration-primary-200 underline-offset-4">
                  这种淡淡的蓝色
                </span>
                ，不扎眼。
              </p>
              <blockquote>引用侧边有一条线，语气轻一点就好。</blockquote>
              <p>
                行内代码：<code>const note = true</code>
              </p>
              <pre>
                <code>{`// 代码块\nfunction later() {\n  return "改天再整理";\n}`}</code>
              </pre>
              <ul>
                <li>列表第一项</li>
                <li>列表第二项</li>
              </ul>
              <table>
                <thead>
                  <tr>
                    <th>列 A</th>
                    <th>列 B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>表格</td>
                    <td>边框很淡</td>
                  </tr>
                </tbody>
              </table>
              <hr />
              <p className="font-sans text-sm text-ink-soft">
                文里的 Mermaid 图由 MermaidEnhancer 在浏览器里画出来。
              </p>
            </div>

            <aside className="max-w-sm rounded-lg border border-line-light bg-surface-light p-6 shadow-editorial dark:border-line-dark dark:bg-surface-dark">
              <p className="font-sans text-xs font-medium text-primary-700 dark:text-primary-300">
                去别的主题看看
              </p>
              <ul className="mt-4 space-y-3 font-sans text-sm text-ink-muted dark:text-gray-300">
                {brandCore.contentPillars.map((pillar) => (
                  <li key={pillar.slug} className="flex justify-between gap-2">
                    <span>{pillar.name}</span>
                    <span className="text-ink-soft">→</span>
                  </li>
                ))}
              </ul>
            </aside>
          </ShowcaseSandbox>
        </ShowcasePanel>
      </ShowcaseSection>

      <ShowcaseSection id="states" label="空状态" title="还没内容时">
        <ShowcasePanel className="py-16 text-center">
          <p className="font-sans text-lg text-ink-muted dark:text-gray-400">
            这里还是空的。
          </p>
          <p className="mt-2 font-sans text-sm text-ink-soft dark:text-gray-500">
            写第一篇笔记之后，这里就会有内容。
          </p>
        </ShowcasePanel>
      </ShowcaseSection>
    </div>
  );
}
