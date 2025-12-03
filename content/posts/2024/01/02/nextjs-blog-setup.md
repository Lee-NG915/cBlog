---
title: 使用 Next.js 搭建个人博客
date: 2024-01-02
category: 技术类
excerpt: 详细介绍如何使用 Next.js 14、TypeScript 和 Markdown 搭建一个现代化的个人博客网站，包括静态站点生成、响应式布局、主题切换等核心功能。
coverCard: https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop
---

# 使用 Next.js 搭建个人博客

Next.js 是一个强大的 React 框架，非常适合构建静态博客网站。本文将详细介绍如何使用 Next.js 14 构建一个功能完整、性能优异的个人博客系统。

## 为什么选择 Next.js？

1. **静态站点生成（SSG）**：可以生成完全静态的 HTML 文件，无需运行时服务器
2. **优秀的性能**：自动代码分割和优化，首屏加载速度快
3. **开发体验好**：热重载、TypeScript 支持、优秀的错误提示
4. **易于部署**：可以轻松部署到 GitHub Pages、Vercel、Netlify 等平台
5. **SEO 友好**：所有内容都在 HTML 中，搜索引擎可以直接抓取

## 项目架构设计

### 技术栈

- **Next.js 14**：使用最新的 App Router 架构
- **TypeScript**：提供类型安全，提升开发效率
- **Tailwind CSS**：实用优先的 CSS 框架，快速构建美观界面
- **gray-matter**：解析 Markdown 文件的 frontmatter
- **remark**：将 Markdown 转换为 HTML
- **date-fns**：日期格式化工具

### 项目结构

```
cBlog/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 根布局（包含侧边栏和主题提供者）
│   ├── categories/        # 分类相关页面
│   │   ├── page.tsx       # 分类列表页
│   │   └── [category]/    # 分类文章列表页
│   ├── posts/             # 文章相关页面
│   │   └── [slug]/        # 文章详情页
│   └── about/             # 关于页面
├── components/            # React 组件
│   ├── Sidebar.tsx        # 桌面端侧边栏
│   ├── MobileHeader.tsx   # 移动端顶部栏
│   ├── MobileDrawer.tsx   # 移动端抽屉菜单
│   ├── PostCard.tsx       # 文章卡片
│   ├── ThemeProvider.tsx  # 主题提供者
│   └── ThemeToggle.tsx    # 主题切换按钮
├── content/               # 内容目录
│   └── posts/            # Markdown 文章（按日期组织）
│       ├── 2024/
│       │   ├── 01/
│       │   │   ├── 01/
│       │   │   │   └── hello-world.md
│       │   │   └── 02/
│       │   │       └── nextjs-blog-setup.md
│       │   └── 12/
│       └── 2025/
├── lib/                   # 工具函数
│   ├── posts.ts          # 文章处理逻辑（核心）
│   ├── navigation.ts     # 导航配置
│   └── utils.ts          # 通用工具函数
└── public/               # 静态资源
    └── images/          # 图片资源
```

## 核心功能实现

### 1. 静态站点生成（SSG）

使用 Next.js 的静态导出功能，所有页面在构建时预先生成：

```javascript
// next.config.js
const nextConfig = {
  output: "export",  // 启用静态导出模式
  images: {
    unoptimized: true,  // 适配静态导出
  },
  trailingSlash: true,
  basePath: basePath,   // 支持 GitHub Pages 子路径
};
```

**优势**：
- 生成纯静态 HTML 文件，加载速度极快
- 无需服务器，可以部署到任何静态托管服务
- SEO 友好，搜索引擎可以直接抓取内容

### 2. 按日期组织的文件结构

文章按日期组织在 `content/posts/` 目录下，支持递归读取：

```typescript
// lib/posts.ts
/**
 * 递归获取目录下所有 Markdown 文件
 * 支持按日期组织的文件夹结构：YYYY/MM/DD/slug.md 或 YYYY/MM/slug.md
 */
function getAllMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith(".md")) {
      const relativePath = path.relative(postsDirectory, filePath);
      fileList.push(relativePath);
    }
  });

  return fileList;
}
```

这种设计的好处：
- 文件组织清晰，便于管理
- 自动从路径提取日期信息
- 支持灵活的文件夹结构

### 3. Markdown 解析与处理

使用 `gray-matter` 解析 frontmatter，`remark` 转换 Markdown：

```typescript
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// 读取并解析 Markdown 文件
const fileContents = fs.readFileSync(fullPath, "utf8");
const { data, content } = matter(fileContents);

// 转换为 HTML
const result = await remark().use(html).process(content);
const htmlContent = result.toString();
```

**处理的功能**：
- 解析 frontmatter（标题、日期、分类、摘要等）
- 转换 Markdown 为 HTML
- 处理图片路径（支持 basePath）
- 计算阅读时间

### 4. 自动分类统计

系统会自动扫描所有文章，统计每个分类下的文章数量：

```typescript
export function getAllCategories(): Category[] {
  const allPosts = getAllPosts();
  const categoryMap = new Map<string, number>();

  allPosts.forEach((post) => {
    const count = categoryMap.get(post.category) || 0;
    categoryMap.set(post.category, count + 1);
  });

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
```

### 5. 静态页面生成

使用 `generateStaticParams` 为所有动态路由生成静态页面：

```typescript
// app/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);
  const content = await markdownToHtml(post.content);
  // ...
}
```

**构建流程**：
1. 扫描所有 Markdown 文件
2. 解析 frontmatter 和内容
3. 为每篇文章生成静态 HTML 页面
4. 输出到 `out/` 目录

### 6. 响应式布局设计

采用现代化响应式布局：

- **桌面端（≥1024px）**：左侧固定侧边栏 + 主内容区域
- **移动端（<1024px）**：顶部固定导航栏 + 抽屉菜单 + 主内容区域

```typescript
// app/layout.tsx
<div className="flex min-h-screen">
  {/* Desktop Sidebar */}
  <Sidebar categories={categories} />
  
  {/* Main Content Area */}
  <div className="flex flex-col flex-1 lg:pl-64">
    {/* Mobile Header */}
    <MobileHeader categories={categories} />
    
    {/* Main Content */}
    <main className="flex-1">
      {children}
    </main>
  </div>
</div>
```

### 7. 主题切换功能

实现完整的深色/浅色主题切换：

```typescript
// components/ThemeProvider.tsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>("light");
  
  useEffect(() => {
    // 从 localStorage 读取或检测系统偏好
    const savedTheme = localStorage.getItem("theme");
    // 应用主题...
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };
}
```

**特性**：
- 自动保存用户偏好
- 支持系统主题检测
- 平滑的过渡动画
- 护眼配色方案

### 8. 阅读时间计算

基于中文字符和英文单词数计算阅读时间：

```typescript
function calculateReadingTime(content: string): number {
  const chineseCharCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWordCount = content
    .split(/\s+/)
    .filter((word) => /^[a-zA-Z]+$/.test(word)).length;
  const totalWords = chineseCharCount + englishWordCount;
  const readingTime = Math.ceil(totalWords / 250);
  return readingTime || 1;
}
```

## 构建与部署

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看效果。

### 构建生产版本

```bash
npm run build
```

构建完成后，静态文件将输出到 `out/` 目录。

### 部署到 GitHub Pages

1. **配置 GitHub Pages**：
   - 进入仓库设置
   - 选择 `Settings` -> `Pages`
   - 在 `Source` 中选择 `GitHub Actions`

2. **推送代码**：
   ```bash
   git add .
   git commit -m "Deploy blog"
   git push origin main
   ```

3. **自动部署**：
   - GitHub Actions 会自动构建并部署
   - 在 `Actions` 标签页查看部署进度

## 项目亮点

1. **完整的类型安全**：使用 TypeScript，减少运行时错误
2. **性能优化**：静态站点生成，首屏加载快
3. **用户体验**：响应式设计、主题切换、平滑动画
4. **易于维护**：清晰的文件组织结构，规范的代码风格
5. **SEO 友好**：所有内容都在 HTML 中，搜索引擎友好
