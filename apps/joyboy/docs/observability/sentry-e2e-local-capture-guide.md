# Sentry E2E 本地抓取指南（人类开发者）

> **面向开发者的操作指南。**  
> AI 规则版请看：[`docs/ai-specs/observability/sentry-e2e-local-capture.md`](../ai-specs/observability/sentry-e2e-local-capture.md)  
> 若两者冲突，以 ai-spec 为准。

本文档用于说明：如何在本地跑 `sentry-tags` 端到端测试，并同时抓取 **client + server** 的 Sentry envelope，避免误上报到云端。

---

## 一、目录结构（本次整理后）

与 Sentry E2E 相关的脚本统一放在：

- `scripts/e2e/sentry/run-local.sh`
- `scripts/e2e/sentry/run-server-capture.sh`
- `scripts/e2e/sentry/mock-ingest.mjs`
- `scripts/e2e/sentry/summarize-server.mjs`
- `scripts/e2e/sentry/summarize-combined.mjs`

网络代理脚本放在：

- `scripts/network/local-api-proxy.mjs`

---

## 二、前置条件：必须用 E2E_LOCAL_ASSETS=1 构建

> **重要 1**：production build 默认把 `assetPrefix` 指向 CDN（`static.castlery.sg`）。
> 本地运行时 CDN 不可达，导致 main-app chunk 加载失败，Sentry 永远不初始化，所有 E2E 测试都会超时。
>
> **重要 2**：所有 `NEXT_PUBLIC_*` 变量均在构建阶段写入 client bundle。  
> 只在 runtime（例如启动 standalone 时）设置它们对浏览器端行为没有任何效果。
>
> **重要 3**：Nx 任务缓存可能复用旧构建产物。  
> E2E 前请显式 `--skip-nx-cache`，确保这次 build 真的用了本地 DSN。

**`run-server-capture.sh` 会自动执行以下所有步骤，不需要手动 build。** 默认构建 **不** 覆盖 `NEXT_PUBLIC_API_HOST`，与 `apps/web/.env.production` 一致（一般为生产 apigw，如 `https://apigw-sg-prod.castlery.com`）。若需要本地 API 代理（8010），在跑脚本前设置 `E2E_USE_LOCAL_API_PROXY=1`。

若需手动构建（默认走 `.env.production` 里的 API host）：

```bash
NEXT_PUBLIC_SENTRY_DSN="http://e2e@localhost:8123/4507648850591744" \
E2E_LOCAL_ASSETS=1 \
pnpm nx build web --skip-nx-cache

# 必须步骤：将静态资源复制进 standalone 目录（参考 Dockerfile-CI 第 25-27 行）
cp -r dist/apps/web/.next/static dist/apps/web/.next/standalone/dist/apps/web/.next/static
cp -r apps/web/public            dist/apps/web/.next/standalone/apps/web/public
```

（可选）构建阶段把 API 指到本地代理：

```bash
NEXT_PUBLIC_SENTRY_DSN="http://e2e@localhost:8123/4507648850591744" \
NEXT_PUBLIC_API_HOST="http://localhost:8010" \
E2E_LOCAL_ASSETS=1 \
pnpm nx build web --skip-nx-cache
# …同上 cp 两步
```

说明：

- `E2E_LOCAL_ASSETS=1`：强制本地加载 chunk（不走 CDN）
- `NEXT_PUBLIC_SENTRY_DSN=http://e2e@localhost:8123/4507648850591744`：让浏览器端 envelope 指向本地 mock ingest
- `NEXT_PUBLIC_API_HOST`：仅在使用 `8010` 代理时需要显式设置；否则用 `.env.production` 中的生产网关
- `--skip-nx-cache`：避免复用旧产物导致 DSN / API host 仍是旧值
- **post-build cp**：Next.js standalone 产物默认**不含** `.next/static` 和 `public`。若跳过此步，standalone server 对所有 JS/CSS 返回 404，页面以未 hydrate 的模糊 HTML 展现，客户端 Sentry 永远不初始化

---

## 三、最常用命令

### 1) 仅 client 抓取（快速）

```bash
E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... pnpm e2e:sentry-tags:local
```

带 UI：

```bash
E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... pnpm e2e:sentry-tags:local -- --ui
```

### 2) client + server 双通道抓取（推荐）

```bash
E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... pnpm e2e:sentry-tags:server-capture
```

这个命令会自动：

1. 以 `E2E_LOCAL_ASSETS=1`、本地 DSN、`--skip-nx-cache` 重新构建 `web`；`NEXT_PUBLIC_API_HOST` 默认来自 `.env.production`（生产网关），若设置 `E2E_USE_LOCAL_API_PROXY=1` 则改为 `http://localhost:8010` 并启动代理
2. 将 `.next/static` 和 `public` 复制进 standalone 目录（参考 Dockerfile-CI）
3. 验证 build 产物包含 mock DSN 与预期的 API host 字符串
4. 启动本地 mock sentry ingest（8123）
5. 仅在 `E2E_USE_LOCAL_API_PROXY=1` 时启动/复用本地 API 代理（8010）
6. 用本地 DSN 启动 standalone（3000）
7. 运行 `sentry-tags`
8. 输出 server 简表 + combined 简表

---

## 三、简表查看

### server 简表

```bash
pnpm e2e:sentry-summary
```

### combined 简表（推荐看这个）

```bash
pnpm e2e:sentry-summary:combined
```

常见字段：

- `source`：`client` / `server`
- `page_type`
- `domain`
- `error_bucket`
- `message`

---

## 四、产物位置

- server envelopes：`.tmp/sentry-mock/server-envelopes.ndjson`
- client envelopes：`.tmp/sentry-mock/client-envelopes.ndjson`

---

## 五、常见问题

### 1) UI 里只看到 Home/Account

通常是命令带了 `--grep`。去掉过滤即可。

### 2) Cart 没跑

这是预期：`Cart` 用例当前是 `test.skip`（迁移未完成）。

### 3) 云端 Sentry 仍有新事件

请优先确认是否真的用的是 `e2e:sentry-tags:server-capture`，以及是否在测试外手动打开了真实 DSN 的页面。

### 4) server 简表为空

不一定是异常。可能本轮只触发了 client 事件。请先看 combined 简表。

### 5) client + server 都为空（而页面看起来正常）

高概率是以下之一：

- Build 复用了缓存产物，client bundle 仍使用旧 DSN
- 若你期望走 `8010` 代理但构建里仍是生产 apigw，请设置 `E2E_USE_LOCAL_API_PROXY=1` 后重跑 `server-capture`

直接重跑 `pnpm e2e:sentry-tags:server-capture` 即可（脚本会自动重建）；或手动执行第二节的完整 build 命令后再重跑。

---

## 六、建议流程（团队统一）

1. 每次 E2E 前先执行第 2 节的强制重建命令（本地 DSN + `--skip-nx-cache`）
2. 本地改动后先跑：`pnpm e2e:sentry-tags:local`
3. 合并前至少跑一次：`pnpm e2e:sentry-tags:server-capture`
4. 在 PR 描述里附上 combined 简表关键行（`page_type/domain/error_bucket`）
