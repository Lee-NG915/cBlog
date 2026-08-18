import { createDb, defaultDbPath } from "../db/client";
import { migrateDb } from "../db/migrate";
import { importPosts, seedCategories } from "../content/import";
import {
  importCollections,
  seedCollections,
} from "../content/collections-import";

const handle = createDb(defaultDbPath());
migrateDb(handle);
seedCategories(handle);
seedCollections(handle);

const posts = importPosts(handle);
console.log(
  `文章导入完成: 扫描 ${posts.scanned}, 新增 ${posts.created}, 更新 ${posts.updated}, 未变 ${posts.unchanged}, 删除 ${posts.deleted}`
);
posts.warnings.forEach((warning) => console.warn(`警告: ${warning}`));

const items = importCollections(handle);
console.log(
  `专栏导入完成: 扫描 ${items.scanned}, 新增 ${items.created}, 更新 ${items.updated}, 未变 ${items.unchanged}, 删除 ${items.deleted}`
);
items.warnings.forEach((warning) => console.warn(`警告: ${warning}`));
