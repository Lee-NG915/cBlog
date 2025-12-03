---
title: 使用 Next.js 搭建个人博客
date: 2024-01-02
category: 技术类
excerpt: 详细介绍如何使用 Next.js 和 Markdown 搭建一个现代化的个人博客网站。
---

# 使用 Next.js 搭建个人博客

Next.js 是一个强大的 React 框架，非常适合构建静态博客网站。

## 为什么选择 Next.js？

1. **静态站点生成（SSG）**：可以生成完全静态的 HTML 文件
2. **优秀的性能**：自动代码分割和优化
3. **开发体验好**：热重载、TypeScript 支持等
4. **易于部署**：可以轻松部署到 GitHub Pages、Vercel 等平台

## 核心功能实现

### Markdown 解析

使用 `gray-matter` 和 `remark` 来处理 Markdown 文件：

```typescript
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const { data, content } = matter(fileContents);
const htmlContent = await remark().use(html).process(content);
```

### 文章分类

通过 frontmatter 中的 `category` 字段来管理文章分类，系统会自动统计每个分类下的文章数量。

### 响应式设计

使用 Tailwind CSS 实现完全响应式的布局，确保在手机、平板和桌面设备上都有良好的显示效果。

## 部署到 GitHub Pages

配置 GitHub Actions 后，每次推送到 main 分支都会自动构建并部署到 GitHub Pages。

希望这个博客系统能帮助你更好地记录和分享你的想法！
