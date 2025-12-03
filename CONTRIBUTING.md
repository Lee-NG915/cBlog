# 使用指南

## 本地开发

1. 安装依赖：

```bash
npm install
# 或
pnpm install
```

2. 启动开发服务器：

```bash
npm run dev
# 或
pnpm dev
```

3. 在浏览器中打开 http://localhost:3000

## 添加新文章

1. 在 `content/posts/` 目录下创建新的 `.md` 文件，文件名将作为 URL slug

2. 在文件开头添加 frontmatter：

```yaml
---
title: 你的文章标题
date: 2024-01-01 # 格式：YYYY-MM-DD
category: 技术类 # 分类名称
excerpt: 文章摘要（可选）
coverCard: /images/covers/tech/my-cover.jpg # 封面图片（可选）
---
```

3. 然后编写 Markdown 内容

## 图片管理

### 目录结构

图片应该放在 `public/images/` 目录下，推荐的组织方式：

```
public/images/
├── covers/          # 文章封面图片
│   ├── tech/       # 技术类文章封面
│   ├── life/       # 日常生活类文章封面
│   ├── study/      # 学习记录类文章封面
│   └── travel/     # 旅游类文章封面
├── posts/          # 文章内容中的图片
│   ├── 2024/       # 按年份分类
│   │   ├── article-1/  # 按文章 slug 分类
│   │   └── article-2/
│   └── 2025/
└── assets/         # 其他资源图片（如 logo、图标等）
```

### 使用封面图片

1. **将图片放到对应目录**：

   - 技术类：`public/images/covers/tech/`
   - 日常生活：`public/images/covers/life/`
   - 学习记录：`public/images/covers/study/`
   - 旅游：`public/images/covers/travel/`

2. **在 frontmatter 中引用**：

   ```yaml
   ---
   title: 我的技术文章
   category: 技术类
   coverCard: /images/covers/tech/nextjs-blog.jpg
   ---
   ```

   注意：路径以 `/` 开头，从 `public` 目录开始

3. **使用外部图片**（可选）：
   ```yaml
   ---
   coverCard: https://images.unsplash.com/photo-xxx
   ---
   ```

### 在文章内容中使用图片

1. **将图片放到 `posts/` 目录**：

   - 建议按年份创建子目录：`public/images/posts/2024/`
   - 或者按文章 slug 创建子目录：`public/images/posts/my-article/`

2. **在 Markdown 中引用**：

   ```markdown
   ![图片描述](/images/posts/2024/my-article/screenshot.png)
   ```

3. **命名建议**：
   - 使用小写字母和连字符：`my-image.jpg`
   - 避免使用空格和特殊字符
   - 使用有意义的文件名

### 图片格式建议

- **封面图片**：

  - 推荐尺寸：1200x675px（16:9）或 1200x900px（4:3）
  - 格式：JPG 或 PNG
  - 文件大小：建议小于 500KB

- **文章内容图片**：
  - 根据内容需要选择合适的尺寸
  - 格式：JPG、PNG 或 WebP
  - 文件大小：建议小于 1MB

## 文章分类

目前支持以下分类（你也可以自定义）：

- 技术类
- 日常生活
- 学习记录
- 旅游

只需在 frontmatter 的 `category` 字段中指定分类名称即可。

## 部署

### 首次部署

1. 在 GitHub 上创建新仓库
2. 将代码推送到仓库：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

3. 配置 GitHub Pages：

   - 进入仓库 Settings -> Pages
   - Source 选择 "GitHub Actions"
   - 保存设置

4. GitHub Actions 会自动构建并部署，完成后可在 `https://你的用户名.github.io/仓库名/` 访问

### 后续更新

只需推送代码到 main 分支，GitHub Actions 会自动重新部署：

```bash
git add .
git commit -m "Update content"
git push
```

## 注意事项

- 如果仓库名是 `你的用户名.github.io`，网站将部署在根路径
- 如果仓库名是其他名称，网站将部署在 `/仓库名/` 路径下
- GitHub Actions 会自动处理路径配置
- 图片路径在本地和部署后都是一样的（从 `/` 开始）
