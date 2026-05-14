# SEO 技术落地方案

本文档基于当前项目架构编写：

- 框架：Next.js App Router
- 输出方式：`output: "export"` 静态导出
- 部署平台：GitHub Pages
- 线上地址：`https://lee-ng915.github.io/cBlog/`
- 内容来源：`content/posts/<category-slug>/<year>/<post-slug>/index.md`

## 1. 是否需要 SEO

需要。这个项目是公开个人博客，内容以文章为核心，且使用 SSG 静态导出。搜索引擎可以直接抓取构建后的 HTML，这是博客类站点最适合做基础 SEO 的形态。

这里的 SEO 目标不是“短期排名技巧”，而是：

- 让搜索引擎发现所有公开页面。
- 让每篇文章有独立标题、描述、规范链接和发布时间。
- 让社交平台分享时有正确的标题、摘要和图片。
- 避免 GitHub Pages 子路径 `/cBlog` 带来的 canonical、sitemap、资源路径错误。
- 保证 URL 稳定、可读、无中文编码问题。

## 2. 当前项目 SEO 风险

### 2.1 GitHub Pages 子路径

线上不是根域名，而是：

```text
https://lee-ng915.github.io/cBlog/
```

因此所有完整 URL 都必须包含 `/cBlog`：

```text
https://lee-ng915.github.io/cBlog/posts/growth-strategy-basics/
https://lee-ng915.github.io/cBlog/categories/technical/
```

不要生成：

```text
https://lee-ng915.github.io/posts/growth-strategy-basics/
```

### 2.2 分类 URL 不能使用中文

已经修正为 ASCII slug：

```text
/categories/technical/
/categories/learning/
/categories/life/
```

不要再使用：

```text
/categories/工程札记/
```

中文只作为展示名，配置在 `lib/site.ts`。

### 2.3 站点 URL 需要集中配置

当前 `lib/site.ts` 只有站点标题、描述和分类。SEO 落地时建议新增：

```ts
export const siteConfig = {
  name: "Color Blog",
  title: "Color 手记",
  description: "写产品判断、工程实践和长期学习中的可复盘经验。",
  author: "Color",
  url: "https://lee-ng915.github.io/cBlog",
};
```

之后 metadata、sitemap、robots、JSON-LD 都从 `siteConfig.url` 读取，避免散落硬编码。

## 3. 必做配置清单

| 优先级 | 项目 | 文件 |
| --- | --- | --- |
| P0 | 全站 metadata / canonical / OG / Twitter | `app/layout.tsx` |
| P0 | sitemap | `app/sitemap.ts` |
| P0 | robots | `app/robots.ts` |
| P0 | 文章页 `generateMetadata()` | `app/posts/[slug]/page.tsx` |
| P1 | 分类页 `generateMetadata()` | `app/categories/[category]/page.tsx` |
| P1 | 首页 JSON-LD `Blog` / `WebSite` | `app/page.tsx` 或组件 |
| P1 | 文章页 JSON-LD `BlogPosting` | `app/posts/[slug]/page.tsx` |
| P1 | 默认 OG 图片 | `public/og/default.png` |
| P2 | Google Search Console 提交 sitemap | 外部平台 |

## 4. URL 规范

### 4.1 文章 URL

文章 URL 使用 frontmatter 的 `slug`：

```text
/posts/growth-strategy-basics/
/posts/nextjs-blog-setup/
```

规范：

- 只用英文小写、数字、连字符。
- 不使用中文。
- 不使用空格。
- 发布后尽量不改。

### 4.2 分类 URL

分类 URL 使用 `lib/site.ts` 中的 `slug`：

```ts
export const postCategories = [
  {
    slug: "technical",
    name: "工程札记",
  },
];
```

URL：

```text
/categories/technical/
```

展示：

```text
工程札记
```

## 5. 全站 Metadata

文件：`app/layout.tsx`

建议把 `metadata` 扩展为：

```ts
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: "zh_CN",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/og/default.png"],
  },
};
```

关键点：

- `metadataBase` 必须使用 `https://lee-ng915.github.io/cBlog`。
- `alternates.canonical` 使用相对路径即可，Next 会基于 `metadataBase` 生成完整 URL。
- OG 图片路径也要能在 `/cBlog/og/default.png` 下访问。

## 6. 文章页 Metadata

文件：`app/posts/[slug]/page.tsx`

新增 `generateMetadata()`：

```ts
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const slug = decodePathSegment(params.slug);
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在",
    };
  }

  const url = `/posts/${post.slug}/`;
  const title = post.title;
  const description = post.excerpt || siteConfig.description;
  const image = post.coverImage || "/og/default.png";

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: siteConfig.title,
      locale: "zh_CN",
      publishedTime: post.date || undefined,
      modifiedTime: post.updatedAt || post.date || undefined,
      authors: [siteConfig.author],
      tags: post.tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
```

注意：

- 不建议依赖 `keywords` 提升排名。
- `description` 应优先使用文章 `excerpt`。
- 没有封面图时使用默认 OG 图。

## 7. 分类页 Metadata

文件：`app/categories/[category]/page.tsx`

分类动态路由参数现在是 slug，例如 `technical`。建议：

```ts
import type { Metadata } from "next";

export function generateMetadata({
  params,
}: CategoryPageProps): Metadata {
  const categories = getAllCategories();
  const category = categories.find((item) => item.slug === params.category);

  if (!category) {
    return {
      title: "阅读路径不存在",
    };
  }

  return {
    title: category.name,
    description: category.description,
    alternates: {
      canonical: `/categories/${category.slug}/`,
    },
    openGraph: {
      type: "website",
      title: `${category.name} | Color 手记`,
      description: category.description,
      url: `/categories/${category.slug}/`,
    },
  };
}
```

## 8. Sitemap

文件：`app/sitemap.ts`

Next.js App Router 支持通过 `app/sitemap.ts` 生成 `sitemap.xml`。

```ts
import type { MetadataRoute } from "next";
import { getAllCategories, getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const baseUrl = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/categories/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = getAllCategories().map(
    (category) => ({
      url: `${baseUrl}/categories/${category.slug}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${baseUrl}/posts/${post.slug}/`,
    lastModified: new Date(post.updatedAt || post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
```

部署后应访问：

```text
https://lee-ng915.github.io/cBlog/sitemap.xml
```

## 9. Robots

文件：`app/robots.ts`

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
```

部署后应访问：

```text
https://lee-ng915.github.io/cBlog/robots.txt
```

## 10. JSON-LD 结构化数据

### 10.1 文章页 `BlogPosting`

文件：`app/posts/[slug]/page.tsx`

在 `PostPage` 中构造：

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt || siteConfig.description,
  datePublished: post.date,
  dateModified: post.updatedAt || post.date,
  author: {
    "@type": "Person",
    name: siteConfig.author,
  },
  publisher: {
    "@type": "Person",
    name: siteConfig.author,
  },
  mainEntityOfPage: `${siteConfig.url}/posts/${post.slug}/`,
  url: `${siteConfig.url}/posts/${post.slug}/`,
  keywords: post.tags,
};
```

渲染：

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
  }}
/>
```

### 10.2 首页 `Blog`

文件：`app/page.tsx`

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: siteConfig.title,
  description: siteConfig.description,
  url: `${siteConfig.url}/`,
  author: {
    "@type": "Person",
    name: siteConfig.author,
  },
};
```

## 11. OG 图片

建议新增：

```text
public/og/default.png
```

要求：

- 尺寸：`1200x630`
- 内容：站点名、简短描述、个人标识
- 风格：与当前 warm editorial 视觉一致
- 文件路径：`/og/default.png`

文章如果没有 `coverImage`，就使用默认图。

如果以后要自动生成 OG 图，可以再考虑 `opengraph-image.tsx`。但在 GitHub Pages 静态导出场景中，先使用静态图片更稳定。

## 12. GitHub Pages 注意事项

### 12.1 basePath

当前 `next.config.js`：

```js
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? process.env.BASE_PATH || "" : "";
```

GitHub Actions 会设置：

```text
BASE_PATH=/cBlog
NEXT_PUBLIC_BASE_PATH=/cBlog
```

因此：

- 页面路由需要能在 `/cBlog/...` 下访问。
- sitemap / robots 中的绝对 URL 需要使用 `https://lee-ng915.github.io/cBlog`。
- 图片路径如果是 `/og/default.png`，Next metadata 会基于 `metadataBase` 处理；普通 Markdown 图片仍需经过现有 `basePath` 处理逻辑。

### 12.2 trailingSlash

当前配置：

```js
trailingSlash: true
```

因此 canonical 和 sitemap 统一使用尾斜杠：

```text
/posts/growth-strategy-basics/
/categories/technical/
```

不要混用无尾斜杠。

## 13. 本地验证

本地先用 GitHub Pages 子路径构建：

```bash
BASE_PATH=/cBlog npm run build
```

构建成功后检查静态产物：

```bash
cat out/sitemap.xml
cat out/robots.txt
rg 'rel="canonical"|property="og:image"|application/ld\+json' out/index.html out/posts/growth-strategy-basics/index.html
sips -g pixelWidth -g pixelHeight public/og/default.png
```

合格标准：

- `out/sitemap.xml` 中所有 URL 都以 `https://lee-ng915.github.io/cBlog/` 开头。
- `out/robots.txt` 指向 `https://lee-ng915.github.io/cBlog/sitemap.xml`。
- 首页、分类页、文章页都有 canonical。
- 文章页有独立 title、description、OpenGraph、Twitter Card 和 `BlogPosting` JSON-LD。
- 首页有 `Blog` JSON-LD。
- `public/og/default.png` 是 `1200x630`。

## 14. 上线后验证

每次发布后检查：

```text
https://lee-ng915.github.io/cBlog/
https://lee-ng915.github.io/cBlog/posts/growth-strategy-basics/
https://lee-ng915.github.io/cBlog/categories/technical/
https://lee-ng915.github.io/cBlog/sitemap.xml
https://lee-ng915.github.io/cBlog/robots.txt
```

检查项：

- 页面不是 404。
- 分类路径不包含中文。
- 页面源代码里有 canonical。
- 文章页有独立 title 和 description。
- sitemap 中 URL 全部包含 `/cBlog`。
- robots.txt 中 sitemap 地址正确。
- OG 图片可访问：`https://lee-ng915.github.io/cBlog/og/default.png`。

## 15. SEO 效果验证

SEO 不是发布后立刻生效，需要分成“抓取可用性”和“搜索表现”两层验证。

### 15.1 Google Search Console

部署完成后，在 Google Search Console 添加 URL 前缀属性：

```text
https://lee-ng915.github.io/cBlog/
```

提交 sitemap：

```text
https://lee-ng915.github.io/cBlog/sitemap.xml
```

后续每次新增文章，不需要手动提交单页，只要 sitemap 更新即可。

重点看这些报告：

- `Sitemaps`：确认提交状态为成功，发现的 URL 数量符合预期。
- `Pages`：确认核心页面被索引；如果未索引，查看具体原因。
- `URL Inspection`：对首页和最新文章执行实时检测，确认 Google 能抓取页面、canonical 正确。
- `Performance`：观察点击、展示、CTR、平均排名。新站通常需要数天到数周才会有稳定数据。

### 15.2 搜索结果验证

上线一段时间后可以用：

```text
site:lee-ng915.github.io/cBlog
site:lee-ng915.github.io/cBlog 增长策略基础
```

如果能看到页面被收录，说明基础索引链路正常。排名是否靠前取决于内容质量、关键词竞争、外链和持续更新，不只取决于技术配置。

### 15.3 分享卡片验证

检查社交分享展示：

- 使用浏览器访问 `https://lee-ng915.github.io/cBlog/og/default.png`。
- 把文章 URL 粘贴到支持 OpenGraph 预览的平台，检查标题、摘要、图片是否正确。
- 如果平台缓存了旧图，通常需要等待缓存过期或使用平台的调试工具刷新。

## 16. 不建议做的事

- 不要把中文分类名放进 URL。
- 不要依赖 `meta keywords`。
- 不要在 robots 中屏蔽 `/_next/`、图片、CSS 等资源。
- 不要让 canonical 缺少 `/cBlog`。
- 不要给公开文章设置 `noindex`。
- 不要频繁修改已发布文章 slug。

## 17. 参考资料

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google canonical URL 指南](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google sitemap 指南](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Next.js Metadata / OG images](https://en.nextjs.im/docs/app/getting-started/metadata-and-og-images)
- [Next.js generateMetadata](https://en.nextjs.im/docs/app/api-reference/functions/generate-metadata/)
- [Next.js robots.ts](https://en.nextjs.im/docs/app/api-reference/file-conventions/metadata/robots)
