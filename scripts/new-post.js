#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const title = process.argv[2];
const category = process.argv[3] || "技术类";

if (!title) {
  console.log("用法: pnpm new-post <标题> [分类] [slug]");
  console.log('分类可选: 技术类, 日常生活, 学习记录, 旅游 (默认: "技术类")');
  console.log("");
  console.log("示例:");
  console.log('  pnpm new-post "Getting Started with Next.js"');
  console.log('  pnpm new-post "旅行日记" 旅游 travel-diary');
  process.exit(1);
}

const now = new Date();
const year = now.getFullYear().toString();
const month = (now.getMonth() + 1).toString().padStart(2, "0");
const day = now.getDate().toString().padStart(2, "0");
const dateStr = `${year}-${month}-${day}`;

const customSlug = process.argv[4];
const slug = customSlug
  ? customSlug
  : title
      .toLowerCase()
      .replace(/[\u4e00-\u9fa5]+/g, "")
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "") || `post-${dateStr}`;

const postDir = path.join(
  process.cwd(),
  "content",
  "posts",
  year,
  month,
  day
);
const postFile = path.join(postDir, `${slug || "new-post"}.md`);

if (fs.existsSync(postFile)) {
  console.error(`文件已存在: ${postFile}`);
  process.exit(1);
}

fs.mkdirSync(postDir, { recursive: true });

const content = `---
title: ${title}
date: ${dateStr}
category: ${category}
excerpt: ""
draft: true
---

在此编写文章内容...
`;

fs.writeFileSync(postFile, content, "utf8");

console.log(`新文章已创建！`);
console.log(`  文件: ${path.relative(process.cwd(), postFile)}`);
console.log(`  标题: ${title}`);
console.log(`  分类: ${category}`);
console.log(`  状态: 草稿 (发布时将 draft 设为 false)`);
