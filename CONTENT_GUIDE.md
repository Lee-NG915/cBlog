# 博客内容编写规范

本文档说明了如何组织和编写博客文章，确保内容的一致性和可维护性。

## 📁 文件组织结构

### 目录结构规范

博客文章应按照**日期**组织在 `content/posts/` 目录下，支持以下两种格式：

#### 推荐格式：按年月日组织
```
content/posts/
├── 2024/
│   ├── 01/
│   │   ├── 01/
│   │   │   └── hello-world.md
│   │   └── 15/
│   │       └── nextjs-blog-setup.md
│   └── 12/
│       └── 03/
│           └── travel-beijing.md
```

#### 简化格式：按年月组织
```
content/posts/
├── 2024/
│   ├── 01/
│   │   ├── hello-world.md
│   │   └── nextjs-blog-setup.md
│   └── 12/
│       └── travel-beijing.md
```

### 文件命名规范

- **文件名**：使用小写字母、数字和连字符（`-`），例如：`hello-world.md`、`nextjs-blog-setup.md`
- **文件扩展名**：必须使用 `.md`
- **slug 生成**：文件名（不含扩展名）将作为文章的 slug，用于 URL 生成

### 目录命名规范

- **年份目录**：4 位数字，例如 `2024`、`2025`
- **月份目录**：2 位数字，01-12，例如 `01`、`12`
- **日期目录**：2 位数字，01-31，例如 `01`、`15`、`31`

## 📝 Frontmatter 规范

每篇文章必须在文件开头包含 frontmatter（YAML 格式），用 `---` 包裹。

### 必需字段

```yaml
---
title: 文章标题
date: 2024-01-01
category: 分类名称
---
```

- **title**：文章标题（字符串）
- **date**：发布日期，格式为 `YYYY-MM-DD`
- **category**：文章分类（字符串）

### 可选字段

```yaml
---
title: 文章标题
date: 2024-01-01
category: 技术类
excerpt: 文章摘要，用于在文章列表中显示
coverCard: /images/covers/tech/my-cover.jpg
---
```

- **excerpt**：文章摘要，用于在文章卡片中显示（字符串）
- **coverCard**：封面图片路径，支持：
  - 本地路径：`/images/covers/tech/my-cover.jpg`（从 `public` 目录开始）
  - 外部 URL：`https://example.com/image.jpg`

### Frontmatter 示例

```yaml
---
title: 使用 Next.js 搭建个人博客
date: 2024-01-15
category: 技术类
excerpt: 详细介绍如何使用 Next.js 和 Markdown 搭建一个现代化的个人博客网站。
coverCard: /images/covers/tech/nextjs-blog.jpg
---
```

## 📄 文章内容规范

### Markdown 语法

文章内容使用标准 Markdown 语法编写，支持：

- 标题（`#`、`##`、`###` 等）
- 段落和换行
- 列表（有序和无序）
- 链接和图片
- 代码块（支持语法高亮）
- 引用
- 表格
- 等等

### 图片使用规范

#### 在文章内容中插入图片

```markdown
![图片描述](/images/posts/2024/01/my-article/image.jpg)
```

#### 图片存储位置

建议按以下结构组织图片：

```
public/images/
├── covers/          # 封面图片
│   ├── tech/       # 技术类封面
│   ├── life/       # 日常生活封面
│   ├── study/      # 学习记录封面
│   └── travel/     # 旅游封面
└── posts/          # 文章内容图片
    └── 2024/       # 按年份组织
        └── 01/     # 按月份组织
            └── my-article/  # 按文章组织
                └── image.jpg
```

#### 图片路径说明

- 本地图片路径以 `/` 开头，从 `public` 目录开始
- 支持外部图片 URL（直接使用完整 URL）
- 系统会自动处理 `basePath`（用于 GitHub Pages 部署）

### 代码块规范

使用三个反引号包裹代码，并指定语言：

````markdown
```typescript
function hello() {
  console.log("Hello, World!");
}
```
````

## 🏷️ 分类规范

### 推荐分类

- **技术类**：技术文章、编程教程、工具使用等
- **日常生活**：生活随笔、日常记录等
- **学习记录**：学习笔记、读书笔记等
- **旅游**：旅行游记、旅游攻略等

### 分类使用

- 可以在 frontmatter 中指定任何分类名称
- 系统会自动统计每个分类下的文章数量
- 分类页面会自动生成

## 📅 日期规范

### 日期格式

- Frontmatter 中的 `date` 字段必须使用 `YYYY-MM-DD` 格式
- 例如：`2024-01-15`、`2025-12-03`

### 日期与文件夹的关系

- **推荐**：文件夹路径与 frontmatter 中的日期保持一致
  - 例如：`2024/01/15/hello-world.md` 对应 `date: 2024-01-15`
- **如果路径中没有日期信息**：系统会尝试从文件路径提取日期
- **如果 frontmatter 中没有日期**：系统会尝试从文件路径提取日期

## ✅ 最佳实践

1. **保持一致性**：尽量让文件夹路径与 frontmatter 中的日期保持一致
2. **使用有意义的文件名**：文件名应该能反映文章的主题
3. **添加摘要**：为每篇文章添加 `excerpt`，提升用户体验
4. **使用封面图片**：为重要文章添加封面图片，提升视觉效果
5. **合理组织图片**：按年份和月份组织图片，便于管理
6. **定期整理**：定期检查并整理文章和图片，保持项目整洁

## 🔍 示例：创建新文章

假设你要在 2024 年 1 月 20 日创建一篇关于 TypeScript 的文章：

1. **创建目录结构**：
   ```
   content/posts/2024/01/20/
   ```

2. **创建文件**：
   ```
   content/posts/2024/01/20/typescript-tips.md
   ```

3. **编写 frontmatter**：
   ```yaml
   ---
   title: TypeScript 实用技巧
   date: 2024-01-20
   category: 技术类
   excerpt: 分享一些 TypeScript 开发中的实用技巧和最佳实践。
   coverCard: /images/covers/tech/typescript.jpg
   ---
   ```

4. **编写文章内容**：
   ```markdown
   # TypeScript 实用技巧
   
   本文将介绍一些 TypeScript 开发中的实用技巧...
   ```

5. **添加相关图片**（如果需要）：
   ```
   public/images/posts/2024/01/typescript-tips/
   └── example.png
   ```

完成！文章会自动出现在博客中。

## 📚 相关文档

- [README.md](./README.md) - 项目整体说明
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南

