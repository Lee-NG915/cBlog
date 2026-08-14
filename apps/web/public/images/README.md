# 图片资源目录

这个目录用于存放博客使用的图片资源。

## 目录结构

```
public/images/
├── covers/          # 文章封面图片
│   ├── tech/       # 技术类文章封面
│   ├── life/       # 日常生活类文章封面
│   ├── study/      # 学习记录类文章封面
│   └── travel/     # 旅游类文章封面
├── posts/          # 文章内容中的图片
│   ├── 2024/       # 按年份分类
│   └── ...
└── assets/         # 其他资源图片（如 logo、图标等）
```

## 使用方式

### 封面图片

将封面图片放在 `covers/` 目录下，可以按分类创建子目录：

```yaml
---
title: 我的文章
coverCard: /images/covers/tech/nextjs-blog.jpg
---
```

### 文章内容图片

将文章内容中的图片放在 `posts/` 目录下，建议按年份或文章 slug 分类：

```markdown
![图片描述](/images/posts/2024/my-article/image.jpg)
```

## 命名建议

- 使用小写字母和连字符：`my-article-cover.jpg`
- 避免使用空格和特殊字符
- 使用有意义的文件名，便于管理
