import { createDb, defaultDbPath } from "../db/client";
import { migrateDb } from "../db/migrate";
import { importPosts, seedCategories } from "../content/import";

const handle = createDb(defaultDbPath());
migrateDb(handle);
seedCategories(handle);
const summary = importPosts(handle);

console.log(
  `内容导入完成: 扫描 ${summary.scanned}, 新增 ${summary.created}, 更新 ${summary.updated}, 未变 ${summary.unchanged}, 删除 ${summary.deleted}`
);
summary.warnings.forEach((warning) => console.warn(`警告: ${warning}`));
