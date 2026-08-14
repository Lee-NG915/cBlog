import fs from "node:fs";
import { createDb, defaultDbPath } from "../db/client";
import { driftCheckPosts } from "../content/import";

/** 漂移检测（FR-2.5）：仅告警不阻断构建，退出码恒为 0 */
if (!fs.existsSync(defaultDbPath())) {
  console.warn("⚠ 数据库不存在，请先执行 pnpm content:import");
  process.exit(0);
}

const handle = createDb(defaultDbPath());
const items = driftCheckPosts(handle);

if (items.length === 0) {
  console.log("✓ frontmatter 与数据库一致，无漂移");
} else {
  console.warn(`⚠ 检测到 ${items.length} 处漂移（数据库为准渲染，建议处理）：`);
  items.forEach((item) => {
    console.warn(`  [${item.kind}] ${item.filePath}: ${item.detail}`);
  });
  console.warn("  手改文件后可执行 pnpm content:import 以文件为准重新导入");
}
