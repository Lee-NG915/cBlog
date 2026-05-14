# 博客内容编写规范

本文档说明如何组织和编写博客文章。当前项目推荐使用文章包结构，旧日期结构仍可读取，但不再作为新文章规范。

## 文件结构

推荐结构：

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
        └── weekend-note/
            └── index.md
```

分类目录：

| 目录 slug   | 分类     |
| ----------- | -------- |
| `technical` | 工程札记 |
| `learning`  | 学习记录 |
| `life`      | 生活手记 |

分类配置位置：`lib/site.ts`。

为了避免 GitHub Pages 上出现中文 URL 编码问题，路由和 frontmatter 都只使用 ASCII 分类 slug。中文只作为展示名称，不进入 URL。

## Frontmatter

每篇文章必须以 YAML frontmatter 开头。

```yaml
---
title: 文章标题
slug: article-slug
date: 2026-05-11
updatedAt: 2026-05-12
category: technical
tags:
  - Next.js
  - GitHub Pages
status: published
excerpt: 文章摘要
coverImage: /images/posts/technical/2026/article-slug/cover.jpg
---
```

字段说明：

- `title`：文章标题。
- `slug`：文章 URL 标识，建议使用英文小写、数字和连字符。
- `date`：发布日期，格式为 `YYYY-MM-DD`。
- `updatedAt`：更新时间，可选。
- `category`：分类 slug，只能使用 `technical`、`learning`、`life`，不要填写中文展示名。
- `tags`：标签数组，可选。
- `status`：`published` 或 `draft`，草稿不会进入公开页面。
- `excerpt`：文章摘要，建议填写。
- `coverImage`：封面图，可选；兼容旧字段 `coverCard`。

## Slug 规则

优先级：

1. 使用 frontmatter 中的 `slug`。
2. 如果文件是 `index.md`，使用父目录名。
3. 如果文件是 `foo.md`，使用文件名 `foo`。

## 图片规范

图片建议放在 `public/images/posts/` 下，按分类和文章组织：

```text
public/images/posts/
└── technical/
    └── 2026/
        └── article-slug/
            ├── cover.jpg
            └── diagram.png
```

文章中使用绝对路径引用：

```markdown
![架构图](/images/posts/technical/2026/article-slug/diagram.png)
```

## Markdown 规范

- 使用标准 Markdown。
- 表格、任务列表等 GFM 语法已支持。
- 代码块使用三个反引号，并标明语言。
- 文章标题使用一个一级标题，正文从二级标题开始分段。

## 新建文章示例

```text
content/posts/technical/2026/typescript-notes/index.md
```

```yaml
---
title: TypeScript 实用笔记
slug: typescript-notes
date: 2026-05-12
category: technical
tags:
  - TypeScript
status: draft
excerpt: 整理 TypeScript 日常开发中的类型建模经验。
---
```

写完后把 `status` 改为 `published` 即可在构建时生成页面。
