# Search API Integration Tests

端到端验证搜索 API 各种场景。测试会自动发现目标环境的可用数据，动态构造请求，无需硬编码。

## 前置条件

测试需要一个运行中的搜索 API 服务。根据目标环境选择：

### 本地开发服务

1. 确保 SSH tunnel 已建立（参考同目录下 `../README(SSH-Porxy).md`）
2. 在**项目根目录**启动 dev server：

```bash
# SG 市场
npx nx serve web --configuration=development.sg

# US 市场（需切换 .env 和 SSH tunnel）
npx nx serve web --configuration=development.us
```

3. 等待 `ready` 后，服务默认运行在 `http://localhost:7780`

### 远程环境

直接使用对应域名即可，无需启动本地服务：

- 测试环境：`https://www-test.castlery.com`
- 生产环境：`https://www.castlery.com`

> **注意**：远程环境测试耗时较长（约 2 分钟），且如果远程环境未部署最新代码，部分测试可能会失败（这恰好说明测试在正确工作）。

## 运行测试

所有命令均在**项目根目录** (`joyboy/`) 执行。

### 环境变量

| 变量                  | 必填 | 默认值 | 说明                                           |
| --------------------- | ---- | ------ | ---------------------------------------------- |
| `SEARCH_API_BASE_URL` | 是   | -      | 目标服务地址（不设则自动 skip 所有测试）       |
| `SEARCH_API_MARKET`   | 否   | `sg`   | 市场代码，影响 API 路径 `/{market}/api/search` |

### 常用命令

```bash
# 本地 SG（最常用）
SEARCH_API_BASE_URL=http://localhost:7780 \
  npx nx test modules-search-components --testPathPattern="search-api.integration" --no-coverage

# 本地 US（先用 nx serve web --configuration=development.us 启动）
SEARCH_API_BASE_URL=http://localhost:7780 SEARCH_API_MARKET=us \
  npx nx test modules-search-components --testPathPattern="search-api.integration" --no-coverage

# 测试环境
SEARCH_API_BASE_URL=https://www-test.castlery.com SEARCH_API_MARKET=sg \
  npx nx test modules-search-components --testPathPattern="search-api.integration" --no-coverage

# 生产环境（只读验证）
SEARCH_API_BASE_URL=https://www.castlery.com SEARCH_API_MARKET=us \
  npx nx test modules-search-components --testPathPattern="search-api.integration" --no-coverage
```

### 一次测多个市场

```bash
for market in sg us au; do
  echo "\n===== Testing $market ====="
  SEARCH_API_BASE_URL=https://www-test.castlery.com SEARCH_API_MARKET=$market \
    npx nx test modules-search-components --testPathPattern="search-api.integration" --no-coverage 2>&1 | tail -20
done
```

### 跳过 Nx 缓存

Nx 会缓存测试结果。代码没改但环境数据变了需要强制重跑：

```bash
SEARCH_API_BASE_URL=http://localhost:7780 \
  npx nx test modules-search-components --testPathPattern="search-api.integration" --no-coverage --skip-nx-cache
```

### 不设环境变量时

所有 51 个测试自动 skip，不影响正常 CI：

```bash
npx nx test modules-search-components --testPathPattern="search-api.integration" --no-coverage
# → Tests: 51 skipped
```

## 测试覆盖场景（18 组，51 个测试）

| #   | 分组                    | 测试数 | 验证内容                                                            |
| --- | ----------------------- | ------ | ------------------------------------------------------------------- |
| 1   | Basic search            | 5      | 无 filter / 关键词 / 分类 / 关键词+分类 / 特殊字符                  |
| 2   | Pagination              | 4      | 翻页 / hitsPerPage / 超大页码 / nbPages 计算                        |
| 3   | Sorting                 | 6      | 4 个索引返回结果 / 价格升序验证 / 价格降序验证                      |
| 4   | Invalid indexName       | 3      | 无效索引 / SQL 注入 → 500 + 空结果                                  |
| 5   | Single facet filtering  | 3      | 单 facet / OR 逻辑 / AND 逻辑（结果缩小）                           |
| 6   | Non-nested facet        | 1      | 无 nestedPath 的 facet（如 styles）                                 |
| 7   | Category + facet        | 2      | 分类+facet 组合 / 比纯分类结果更少                                  |
| 8   | Keyword + filters       | 2      | 关键词+facet / 关键词+数值区间                                      |
| 9   | Same-nestedPath combos  | 1      | 共享 nestedPath 的 facet 两两组合（inner_hits 去重）                |
| 10  | Cross-nestedPath combos | 1      | 不同 nestedPath 的 facet 组合                                       |
| 11  | Numeric filters         | 4      | 价格区间 / facet+数值 / lead_time / 窄区间更少结果                  |
| 12  | Disjunctive faceting    | 2      | N 个 filter → N+1 个 sub-request / facets-only                      |
| 13  | Variant filtering       | 2      | 返回 variants 包含目标颜色 / 无匹配产品被过滤                       |
| 14  | Image cleanup           | 1      | images 只含 large 字段                                              |
| 15  | Invalid input           | 6      | 非数组 / 空数组 / 畸形 JSON → 优雅降级                              |
| 16  | Response structure      | 5      | 字段完整性 / 产品结构 / inner_hits 隐藏 / variant 字段 / facet 计数 |
| 17  | Concurrent requests     | 1      | 5 并发正确返回                                                      |
| 18  | Keyword relevance       | 2      | 精确匹配分数更高 / 不同关键词不同结果                               |

## 设计原则

1. **自发现** — 先查询目标环境拿到实际可用的 facet 值，再构造测试请求。数据变了测试自动适应。
2. **从配置推导** — 直接读 `FACET_ATTRIBUTES_CONFIG`，按 `nestedPath` 分组找冲突点。配置改了测试自动覆盖新场景。
3. **CI 安全** — 不设 `SEARCH_API_BASE_URL` 时所有测试自动 skip，不影响正常的 `nx test`。
4. **跨环境通用** — 同一套测试代码适用于本地 / 测试 / 生产，任何市场。
