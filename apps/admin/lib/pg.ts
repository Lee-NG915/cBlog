import {
  createPostgresDb,
  PostgresCategoryRepository,
  PostgresCollectionItemRepository,
  PostgresCollectionRepository,
  PostgresPostRepository,
  PostgresPublicContentReader,
  type PostgresDbHandle,
} from "@cblog/core/postgres";
import { requireDatabaseUrl } from "@/lib/env";

/** dev HMR 下复用连接池，避免热更新累积连接 */
const globalRef = globalThis as unknown as {
  __cblogPgHandle?: PostgresDbHandle;
};

export function pgHandle(): PostgresDbHandle {
  if (!globalRef.__cblogPgHandle) {
    globalRef.__cblogPgHandle = createPostgresDb(requireDatabaseUrl(), {
      max: 5,
    });
  }
  return globalRef.__cblogPgHandle;
}

export function publicReader(): PostgresPublicContentReader {
  return new PostgresPublicContentReader(pgHandle());
}

export function postRepository(): PostgresPostRepository {
  return new PostgresPostRepository(pgHandle());
}

export function collectionItemRepository(): PostgresCollectionItemRepository {
  return new PostgresCollectionItemRepository(pgHandle());
}

export function categoryRepository(): PostgresCategoryRepository {
  return new PostgresCategoryRepository(pgHandle());
}

export function collectionRepository(): PostgresCollectionRepository {
  return new PostgresCollectionRepository(pgHandle());
}
