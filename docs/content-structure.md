# 博客文件结构分析与规范

## 当前结论

推荐把文章从纯日期目录调整为“分类 slug / 年份 / 文章 slug / index.md”的文章包结构：

```text
content/posts/
├── technical/
│   └── 2024/
│       └── nextjs-blog-setup/
│           └── index.md
├── learning/
│   └── 2026/
│       └── growth-strategy-basics/
│           └── index.md
└── life/
    └── 2026/
        └── example-note/
            └── index.md
```

这个结构比 `YYYY/MM/DD/slug.md` 更适合长期维护：

- 分类在目录层显式可见，不只依赖 frontmatter。
- 年份目录保留时间归档能力，但不让月份/日期层级过深。
- 每篇文章是一个独立文章包，未来可扩展草稿、图片说明、引用资料等。
- URL slug 与文章目录一致，适合保持稳定链接。
- 管理后台二期更容易按分类和文章包扫描、创建、编辑、删除。

## 分类目录

| 目录 slug   | 分类     |
| ----------- | -------- |
| `technical` | 工程札记 |
| `learning`  | 学习记录 |
| `life`      | 生活手记 |

分类 slug 配置在 `lib/site.ts`。读取逻辑会优先使用 frontmatter 的 `category` slug，如果没有，就从路径第一段推导分类。

规范：URL 和 frontmatter 只能使用 ASCII slug，不能使用中文分类名。中文分类名只在 `lib/site.ts` 的 `name` 字段中配置，用于页面展示。

## 文章 slug

推荐在 frontmatter 中显式写 `slug`：

```yaml
---
title: 增长策略基础
slug: growth-strategy-basics
date: 2026-05-11
category: learning
---
```

如果没有 `slug`：

- `content/posts/technical/2024/foo/index.md` 会推导为 `foo`
- `content/posts/2024/01/02/foo.md` 会推导为 `foo`

## 图片与附件

GitHub Pages 只发布静态产物，文章引用的图片仍建议放在 `public/images/posts/` 下：

```text
public/images/posts/
└── technical/
    └── 2024/
        └── nextjs-blog-setup/
            └── cover.jpg
```

文章内引用：

```markdown
![说明](/images/posts/technical/2024/nextjs-blog-setup/cover.jpg)
```

这样图片会被 Next.js 静态导出复制到 `out/`，并且 GitHub Pages 可以直接访问。

## 保留兼容

读取逻辑仍兼容旧结构：

```text
content/posts/YYYY/MM/DD/slug.md
content/posts/YYYY/MM/slug.md
```

但新文章应统一使用文章包结构。
