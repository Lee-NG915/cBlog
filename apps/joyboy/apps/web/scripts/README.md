# Sales Fallback 降级方案说明

## 🎯 问题背景

在 middleware 中判断 sale pages 路由时，如果 CMS API 不可用，会导致所有 sale 相关页面（如 Black Friday）无法访问，对业务影响重大。

## ✅ 解决方案

实现了一个完整的降级兜底机制：

### 架构设计

```
用户请求 /sg/black-friday
         ↓
    Middleware (Edge Runtime)
         ↓
  fetchSales() 调用 API
         ↓
    ┌────┴────┐
    ↓         ↓
  ✅ 成功   ❌ 失败（503/超时/错误）
    ↓         ↓
使用API数据  读取内嵌的 fallbackData.ts
            (编译时打包的常量)
```

### 核心特点

1. **Edge Runtime 兼容** ✅

   - 不使用 Node.js 的 `fs`, `path` 模块
   - 数据以 TypeScript 常量形式内嵌在代码中
   - 编译时打包进 bundle，无运行时文件读取

2. **多层降级保护** ✅

   - API 正常 → 使用实时数据
   - API 返回 503 → 使用 fallback
   - API 返回无效数据 → 使用 fallback
   - API 请求超时/失败 → 使用 fallback

3. **完整监控日志** ✅
   - 记录所有降级事件
   - 包含市场、数据条数、最后更新时间
   - 便于设置告警规则

## 📁 相关文件

### 1. 降级数据源

- `middleware/lib/fallbackData.ts` - TypeScript 常量文件（自动生成）
- `public/fallback/sales-*.json` - JSON 备份文件（可选，用于查看）

### 2. 核心逻辑

- `middleware/lib/apiClient.ts` - 包含降级逻辑的 API 客户端
- `middleware/middlewares/saleMiddleware.ts` - Sale 页面路由中间件

### 3. 更新脚本

- `scripts/update-sales-fallback.ts` - 从 API 拉取数据并生成 fallbackData.ts

## 🚀 使用方式

### 1. 手动更新 fallback 数据

```bash
# 在项目根目录运行
pnpm tsx apps/web/scripts/update-sales-fallback.ts
```

输出示例：

```
🚀 Starting sales fallback data update...

Fetching sales data for SG...
✅ Successfully fetched 15 sales for SG
✅ Updated JSON file: /path/to/public/fallback/sales-sg.json

...（其他市场）

📝 Generating TypeScript fallback data file...
✅ Updated TypeScript file: /path/to/middleware/lib/fallbackData.ts

📊 Summary:
   ✅ Success: 5/5
   ❌ Failed: 0/5

🎉 Fallback data update complete!
```

### 2. 集成到 CI/CD

在部署流程中添加：

```yaml
# .github/workflows/deploy.yml
- name: Update fallback data before build
  run: pnpm tsx apps/web/scripts/update-sales-fallback.ts

- name: Build application
  run: pnpm build
```

### 3. 定时更新（可选）

设置 cron job 每天更新：

```bash
# 每天凌晨 3 点更新
0 3 * * * cd /path/to/project && pnpm tsx apps/web/scripts/update-sales-fallback.ts && git add . && git commit -m "chore: update sales fallback data" && git push
```

## 📋 部署前检查清单

黑五等大促前 24 小时：

- [ ] 运行更新脚本获取最新数据
- [ ] 确认 `middleware/lib/fallbackData.ts` 已更新
- [ ] 检查生成的数据包含关键 sale pages（如 Black Friday）
- [ ] 验证数据格式正确
- [ ] 提交代码并部署

## 🔍 监控和告警

### 关键日志

当使用 fallback 时，会记录以下日志：

```typescript
logger.warn('Using fallback sales data', {
  market: 'sg',
  count: 15,
  lastUpdated: '2024-11-17T03:00:00.000Z',
});
```

### 建议的告警规则

在 Datadog/Sentry 等平台设置告警：

- **告警条件**: 检测到 "Using fallback sales data" 日志
- **严重级别**: 高（P1）
- **通知对象**: On-call 工程师 + 产品经理
- **处理时间**: 15 分钟内响应

## 🐛 故障排查

### 问题 1: fallbackData.ts 数据为空

**原因**: 未运行更新脚本或 API 调用失败

**解决**:

```bash
pnpm tsx apps/web/scripts/update-sales-fallback.ts
```

### 问题 2: 收到 "Fallback sales data not found" 错误

**原因**: 市场代码不匹配或文件未生成

**解决**:

1. 检查 `EcEnv.NEXT_PUBLIC_COUNTRY` 值
2. 确认 `FALLBACK_SALES_DATA` 中有对应市场的数据

### 问题 3: Fallback 数据过期

**原因**: 长时间未更新

**影响**: 可能包含已过期的 sale pages

**解决**: 定期运行更新脚本（建议每天一次）

## 💡 最佳实践

### 1. 大促前准备

- 提前 24 小时更新 fallback 数据
- 验证关键 sale pages 都在数据中
- 进行一次降级测试（暂时关闭 API）

### 2. 数据新鲜度

- 正常情况：每天自动更新一次
- 大促期间：每小时更新一次
- 紧急情况：手动立即更新

### 3. Bundle 大小管理

如果 fallback 数据过大（>100 条）：

- 考虑只保留活跃的 sale pages
- 或使用压缩技术
- 或改用 fetch 静态 JSON 文件方案（需要权衡）

## 🔗 相关链接

- [Next.js Edge Runtime 文档](https://nextjs.org/docs/app/api-reference/edge)
- [Middleware 最佳实践](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## 📊 技术指标

- **Fallback 数据大小**: 约 5-20KB（每个市场）
- **编译时打包**: 数据内嵌在 bundle 中
- **运行时开销**: 零（无文件 I/O，无网络请求）
- **降级响应时间**: <1ms（内存读取）

## ✨ 未来改进

1. **自动化更新**: GitHub Actions 定时任务自动更新并提交
2. **数据压缩**: 对大数据集使用 gzip 压缩
3. **多版本管理**: 保留历史版本用于回滚
4. **A/B 测试**: 测试 fallback 方案的实际效果
