---
title: 欢迎来到我的博客
date: 2024-01-01
category: 技术类
excerpt: 这是我的第一篇博客文章，介绍博客的创建和使用方法。
---

# 欢迎来到我的博客

你好！欢迎来到我的个人博客。这个博客使用 Next.js 构建，支持 Markdown 格式的文章。

## 功能特点

- 📝 支持 Markdown 格式编写文章
- 🏷️ 文章分类管理
- 📱 完全响应式设计，支持移动端和桌面端
- 🚀 自动部署到 GitHub Pages
- ⚡ 快速加载和优秀的性能

## 如何添加新文章

1. 在 `content/posts` 目录下创建新的 `.md` 文件
2. 在文件开头添加 frontmatter：

```yaml
---
title: 文章标题
date: 2024-01-01
category: 分类名称
excerpt: 文章摘要
coverCard: /images/covers/tech/my-cover.jpg # 可选：封面图片
---
```

3. 然后编写你的文章内容即可

### 添加图片到文章

在文章内容中可以使用 Markdown 语法插入图片：

```markdown
![图片描述](/images/posts/2024/my-article/image.jpg)
```

图片应该放在 `public/images/posts/` 目录下，建议按年份或文章 slug 创建子目录来组织。

## 支持的文章分类

- 技术类
- 日常生活
- 学习记录
- 旅游

你也可以添加其他分类，只需要在 frontmatter 中指定即可。

希望你能在这里找到有价值的内容！
