import { createDb, defaultDbPath } from "../db/client";
import { migrateDb } from "../db/migrate";

const handle = createDb(defaultDbPath());
migrateDb(handle);
console.log(`数据库迁移完成: ${handle.dbPath}`);
