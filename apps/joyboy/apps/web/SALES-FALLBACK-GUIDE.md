# Sales API 降级方案完整指南

## 📋 目录

- [问题背景](#问题背景)
- [解决方案](#解决方案)
- [架构设计](#架构设计)
- [使用指南](#使用指南)
- [测试验证](#测试验证)
- [监控告警](#监控告警)
- [部署流程](#部署流程)
- [故障排查](#故障排查)

---

## 问题背景

### 原始问题

在 middleware 中判断 sale pages 路由时，依赖 `/api/sales` 接口：

```typescript
// middleware/middlewares/saleMiddleware.ts
const salesResponse = await fetchSales(); // 调用 /api/sales
const matchedSale = sales.find((sale) => sale.url === originalPathname);
```

**风险：**

- ❌ 如果 CMS API 不可用 → `salesResponse` 为空
- ❌ 所有 sale pages（如 Black Friday）无法访问 → 404 错误
- ❌ 黑五等大促期间不可接受的业务风险

### 影响范围

| 场景          | 受影响页面数量    | 业务影响 |
| ------------- | ----------------- | -------- |
| 新加坡 (SG)   | 208 个 sale pages | 🔴 严重  |
| 美国 (US)     | 147 个 sale pages | 🔴 严重  |
| 澳大利亚 (AU) | 145 个 sale pages | 🔴 严重  |
| 加拿大 (CA)   | 125 个 sale pages | 🔴 严重  |
| 英国 (UK)     | 131 个 sale pages | 🔴 严重  |

---

## 解决方案

### 核心思路

**多层降级保护 + Edge Runtime 兼容**

```
┌────────────────────────────────────────────────────┐
│ 1. API 请求层 (apiClient.ts)                       │
│    ├─ 尝试调用 /api/sales                           │
│    ├─ 检查响应状态 (200/503/timeout)                │
│    └─ 数据验证 (非空/格式正确)                       │
└────────────────────────────────────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
    ✅ API 成功           ❌ API 失败
         ↓                     ↓
   使用实时数据          读取 fallbackData.ts
   (208+ pages)          (编译时打包的静态数据)
         ↓                     ↓
    ┌─────────────────────────────┐
    │ 2. Middleware 层            │
    │    ├─ 路由匹配判断           │
    │    └─ Rewrite 到内部页面     │
    └─────────────────────────────┘
```

### 技术特点

| 特性                  | 实现方式               | 优势                                |
| --------------------- | ---------------------- | ----------------------------------- |
| **Edge Runtime 兼容** | 数据编译时打包到代码中 | ✅ 无文件 I/O<br>✅ 无 Node.js 依赖 |
| **零运行时开销**      | 内存常量读取           | ✅ <1ms 响应<br>✅ 无网络请求       |
| **自动降级**          | API 失败自动切换       | ✅ 无需人工干预<br>✅ 透明切换      |
| **完整监控**          | 结构化日志记录         | ✅ 可设置告警<br>✅ 便于排查        |

---

## 架构设计

### 文件结构

```
apps/web/
├── middleware/
│   ├── lib/
│   │   ├── apiClient.ts          # API 客户端 + 降级逻辑
│   │   └── fallbackData.ts       # 内嵌 fallback 数据 (168KB)
│   └── middlewares/
│       └── saleMiddleware.ts      # Sale 页面路由中间件
│
├── app/api/sales/
│   └── route.ts                   # Sales API 路由
│
├── scripts/
│   ├── update-sales-fallback.ts   # 更新脚本
│   └── README.md                   # 脚本文档
│
└── public/fallback/               # JSON 备份（被 gitignore）
    ├── .gitignore
    └── sales-*.json               # 可选的 JSON 备份文件
```

### 数据流转

#### 正常流程（API 可用）

```typescript
用户访问 /sg/black-friday
         ↓
saleMiddleware
         ↓
fetchSales() → API: /api/sales
         ↓
    ✅ 200 OK
         ↓
返回 208 个 sale pages
         ↓
匹配到 /black-friday
         ↓
Rewrite → /sales/{uuid}
         ↓
页面成功渲染 🎉
```

#### 降级流程（API 失败）

```typescript
用户访问 /sg/black-friday
         ↓
saleMiddleware
         ↓
fetchSales() → API: /api/sales
         ↓
    ❌ 503 / Timeout / 错误
         ↓
loadFallbackSales()
         ↓
读取 FALLBACK_SALES_DATA['sg']
         ↓
返回 208 个 sale pages (fallback)
         ↓
⚠️  logger.warn('Using fallback sales data')
         ↓
匹配到 /black-friday
         ↓
Rewrite → /sales/{uuid}
         ↓
页面成功渲染 🎉
```

---

## 使用指南

### 1. 更新 Fallback 数据

**黑五前必做（提前 24 小时）：**

```bash
# 在项目根目录运行
cd /path/to/castlery/joyboy
npx tsx apps/web/scripts/update-sales-fallback.ts
```

**预期输出：**

```
🚀 Starting sales fallback data update...

Fetching sales data for SG...
✅ Successfully fetched 208 sales for SG
✅ Updated JSON file: /path/to/public/fallback/sales-sg.json

Fetching sales data for US...
✅ Successfully fetched 147 sales for US
✅ Updated JSON file: /path/to/public/fallback/sales-us.json

...（其他市场）

📝 Generating TypeScript fallback data file...
✅ Updated TypeScript file: /path/to/middleware/lib/fallbackData.ts

📊 Summary:
   ✅ Success: 5/5
   ❌ Failed: 0/5

🎉 Fallback data update complete!

Generated files:
  - /path/to/middleware/lib/fallbackData.ts
  - /path/to/public/fallback/sales-sg.json
  - /path/to/public/fallback/sales-us.json
  - /path/to/public/fallback/sales-au.json
  - /path/to/public/fallback/sales-ca.json
  - /path/to/public/fallback/sales-uk.json
```

### 2. 验证生成的数据

```bash
# 检查文件大小
ls -lh apps/web/middleware/lib/fallbackData.ts
# 预期: ~168KB

# 查看行数
wc -l apps/web/middleware/lib/fallbackData.ts
# 预期: ~6000 行

# 验证包含关键页面
grep "black-friday" apps/web/middleware/lib/fallbackData.ts
```

### 3. 提交并部署

```bash
# 提交更新的 fallback 数据
git add apps/web/middleware/lib/fallbackData.ts
git commit -m "chore: update sales fallback data for Black Friday"
git push

# 部署
pnpm build
pnpm deploy
```

---

## 测试验证

### 方法 1: 本地测试（推荐）

#### 步骤 1: 启动开发服务器

```bash
cd apps/web
pnpm dev
```

#### 步骤 2: 验证 API 正常工作

```bash
# 测试 API
curl http://localhost:7780/sg/api/sales | jq '.value | length'
# 预期输出: 208 (或其他数字)

# 测试 Middleware 路由
curl -I http://localhost:7780/sg/sale
# 预期: HTTP/1.1 200 OK
# 预期: X-Middleware-Rewrite: /desktop-new/sg/en/sales/{uuid}
```

#### 步骤 3: 模拟 API 失败

**临时修改 `apiClient.ts` 测试降级：**

```typescript
// middleware/lib/apiClient.ts
export async function fetchSales(): Promise<ApiResponse<SaleInfo[]>> {
  // 🧪 测试降级：强制返回错误
  return {
    data: null,
    error: 'Simulated API failure for testing',
  };

  // const url = `${EcEnv.APP_API_BASE_URL}/sales`;
  // ... 原有代码
}
```

**重启服务并测试：**

```bash
# 重启开发服务器
# Ctrl+C 然后重新运行 pnpm dev

# 测试降级是否生效
curl http://localhost:7780/sg/sale

# 查看日志，应该看到：
# ⚠️  logger.warn('Using fallback sales data', {
#   market: 'sg',
#   count: 208,
#   lastUpdated: '2025-11-17T03:18:38.164Z'
# })
```

**测试完成后记得恢复代码！**

### 方法 2: 生产环境监控

#### 查看日志

```bash
# Datadog / CloudWatch / 你的日志系统
# 搜索关键词: "Using fallback sales data"

# 日志格式:
{
  "level": "warn",
  "message": "Using fallback sales data",
  "market": "sg",
  "count": 208,
  "lastUpdated": "2025-11-17T03:18:38.164Z",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

---

## 监控告警

### 关键指标

| 指标                     | 说明              | 告警阈值    |
| ------------------------ | ----------------- | ----------- |
| **fallback_usage_count** | Fallback 使用次数 | > 0 次/分钟 |
| **api_error_rate**       | API 错误率        | > 5%        |
| **fallback_data_age**    | Fallback 数据年龄 | > 7 天      |

### Datadog 告警配置

```yaml
# datadog_monitors/sales_fallback.yaml
name: 'Sales API Fallback Usage Alert'
type: 'log alert'
query: |
  logs("service:joyboy-web message:\"Using fallback sales data\"").index("*").rollup("count").by("market").last("5m") > 0

message: |
  🚨 **Sales API 降级告警**

  Market: {{market.name}}
  Fallback 正在被使用，可能 CMS API 不可用。

  **立即行动：**
  1. 检查 CMS API 状态
  2. 查看详细日志
  3. 如持续超过 15 分钟，上报 P1 事件

  @Teams-oncall @pagerduty

tags:
  - service:joyboy-web
  - severity:high
  - component:sales-api

priority: 2 # P2
```

### 建议的告警规则

#### 1. Fallback 使用告警（立即通知）

```
触发条件: 检测到 "Using fallback sales data" 日志
严重级别: P2 (High)
通知渠道: Teams + Email
响应时间: 15 分钟内
```

#### 2. Fallback 数据过期告警（每日检查）

```
触发条件: fallbackData.ts 的 lastUpdated > 7 天
严重级别: P3 (Medium)
通知渠道: Teams
响应时间: 24 小时内
```

#### 3. API 持续失败告警（升级为 P1）

```
触发条件: Fallback 使用持续 > 30 分钟
严重级别: P1 (Critical)
通知渠道: Pager Duty + Teams + 电话
响应时间: 立即
```

---

## 部署流程

### 黑五前部署 Checklist

**提前 48 小时：**

- [ ] 运行更新脚本获取最新数据
- [ ] 验证生成的 `fallbackData.ts` 文件
- [ ] 检查包含 Black Friday 等关键页面
- [ ] 提交代码并通过 CI/CD
- [ ] 部署到 Staging 环境
- [ ] 执行完整测试（包括降级测试）

**提前 24 小时：**

- [ ] 再次运行更新脚本
- [ ] 部署到 Production
- [ ] 验证所有市场的 sale pages 可访问
- [ ] 配置监控告警规则
- [ ] 通知 On-call 团队

**黑五当天：**

- [ ] 持续监控 fallback 使用情况
- [ ] 准备好应急预案
- [ ] 保持团队在线待命

### CI/CD 集成

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # 更新 fallback 数据（可选）
      - name: Update fallback data
        run: |
          npx tsx apps/web/scripts/update-sales-fallback.ts
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add apps/web/middleware/lib/fallbackData.ts
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: auto-update sales fallback data"
        continue-on-error: true # 如果没有更新不报错

      # 验证 fallback 文件存在
      - name: Verify fallback data
        run: |
          test -f apps/web/middleware/lib/fallbackData.ts || exit 1
          echo "✅ Fallback data file exists"

          # 检查文件大小 (应该 > 100KB)
          FILE_SIZE=$(wc -c < apps/web/middleware/lib/fallbackData.ts)
          if [ $FILE_SIZE -lt 100000 ]; then
            echo "❌ Fallback data file is too small: $FILE_SIZE bytes"
            exit 1
          fi
          echo "✅ Fallback data file size OK: $FILE_SIZE bytes"

      # 构建和部署
      - name: Build application
        run: pnpm build

      - name: Deploy to production
        run: pnpm deploy
```

---

## 故障排查

### 问题 1: Fallback 数据为空

**症状：**

```bash
grep "value: \[\]" apps/web/middleware/lib/fallbackData.ts
```

**原因：**

- 更新脚本未运行
- API 调用失败时脚本返回空数组

**解决：**

```bash
# 重新运行更新脚本
npx tsx apps/web/scripts/update-sales-fallback.ts

# 如果还是失败，检查 API 是否可访问
curl https://www.castlery.com/sg/api/sales
```

---

### 问题 2: TypeScript 编译错误

**症状：**

```
Error: Object literal may only specify known properties,
and 'query_deliver_before' does not exist in type 'SaleInfo'.
```

**原因：**

- `fallbackData.ts` 缺少 `// @ts-nocheck` 注释

**解决：**

```bash
# 检查文件头部
head -5 apps/web/middleware/lib/fallbackData.ts

# 应该包含:
# /* eslint-disable */
# // @ts-nocheck

# 如果缺失，重新运行更新脚本
npx tsx apps/web/scripts/update-sales-fallback.ts
```

---

### 问题 3: Middleware 无法读取 fallback 数据

**症状：**

```
logger.error('Fallback sales data not found', {
  market: 'sg',
  availableMarkets: ['sg', 'us', 'au', 'ca', 'uk']
})
```

**原因：**

- `NEXT_PUBLIC_COUNTRY` 环境变量不正确
- Fallback 数据文件未正确导入

**解决：**

```bash
# 1. 检查环境变量
echo $NEXT_PUBLIC_COUNTRY
# 应该输出: SG / US / AU / CA / UK

# 2. 验证导入
grep "import.*FALLBACK_SALES_DATA" apps/web/middleware/lib/apiClient.ts

# 3. 检查 fallbackData.ts 导出
grep "export const FALLBACK_SALES_DATA" apps/web/middleware/lib/fallbackData.ts
```

---

### 问题 4: 页面仍然 404

**症状：**

- Fallback 日志正常
- 但访问 sale 页面仍然 404

**排查步骤：**

```bash
# 1. 验证 fallback 数据中包含该 URL
grep "/black-friday" apps/web/middleware/lib/fallbackData.ts

# 2. 检查 middleware 日志
# 应该看到: "Sale page rewritten"

# 3. 验证 UUID 正确
curl http://localhost:7780/sg/api/sales | jq '.value[] | select(.url=="/black-friday")'

# 4. 检查对应的页面文件是否存在
# 根据 rewrite 路径检查
```

---

## 最佳实践

### 1. 数据更新频率

| 场景           | 更新频率 | 说明                 |
| -------------- | -------- | -------------------- |
| **正常时期**   | 每周一次 | 通过 CI/CD 自动更新  |
| **大促准备期** | 每天一次 | 确保数据最新         |
| **大促当天**   | 按需更新 | 有新 sale 时立即更新 |

### 2. 文件大小管理

当前 fallback 数据：**168KB**

如果增长到 >500KB：

- ✅ 考虑只保留活跃的 sale pages
- ✅ 移除已过期的数据
- ✅ 使用数据压缩

### 3. 安全注意事项

- ✅ **不要** 在 fallback 数据中包含敏感信息
- ✅ **不要** 提交 `public/fallback/*.json` 到 git (已在 .gitignore)
- ✅ **定期** 验证数据完整性
- ✅ **监控** fallback 使用频率

---

## 相关链接

- [Next.js Middleware 文档](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Edge Runtime 兼容性](https://nextjs.org/docs/app/api-reference/edge)
- [更新脚本 README](./scripts/README.md)

---

## 联系方式

如有问题，请联系：

- **技术负责人**: @wcdaren
- **Teams 频道**: #joyboy-tech-support
- **紧急联系**: On-call 工程师

---

**最后更新**: 2025-11-17
**维护者**: Joyboy Team
