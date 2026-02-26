#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.join(process.cwd(), "content/posts");
let errors = 0;
let warnings = 0;
let postCount = 0;

function getAllMdFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMdFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

const mdFiles = getAllMdFiles(postsDir);

for (const file of mdFiles) {
  postCount++;
  const relativePath = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, "utf8");

  let data;
  try {
    const parsed = matter(content);
    data = parsed.data;
  } catch (e) {
    console.error(`[ERROR] ${relativePath}: Frontmatter 解析失败 - ${e.message}`);
    errors++;
    continue;
  }

  if (!data.title) {
    console.error(`[ERROR] ${relativePath}: 缺少 title 字段`);
    errors++;
  }

  if (!data.date) {
    console.warn(`[WARN]  ${relativePath}: 缺少 date 字段`);
    warnings++;
  }

  if (!data.category) {
    console.warn(`[WARN]  ${relativePath}: 缺少 category 字段`);
    warnings++;
  }

  if (!data.excerpt) {
    console.warn(`[WARN]  ${relativePath}: 缺少 excerpt 字段（建议添加摘要）`);
    warnings++;
  }
}

console.log("");
console.log(`验证完成: ${postCount} 篇文章`);
console.log(`  错误: ${errors}`);
console.log(`  警告: ${warnings}`);

if (errors > 0) {
  process.exit(1);
}
