import postgres, { type Options, type Sql } from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export interface PostgresDbHandle {
  client: Sql;
  db: PostgresJsDatabase<typeof schema>;
}

export function createPostgresDb(
  connectionString: string,
  options: Options<Record<string, never>> = {}
): PostgresDbHandle {
  if (!connectionString.trim()) {
    throw new Error("PostgreSQL connection string 不能为空");
  }

  const client = postgres(connectionString, {
    max: 5,
    prepare: false,
    ...options,
  });
  return { client, db: drizzle(client, { schema }) };
}

export async function closePostgresDb(handle: PostgresDbHandle): Promise<void> {
  await handle.client.end({ timeout: 5 });
}
