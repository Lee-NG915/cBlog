# 使用指南

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
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
---
```

3. 然后编写 Markdown 内容

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
