# 🔧 Middleware 日志优化解决方案

## 🎯 问题分析

之前的 middleware 中存在大量的 `console.log`、`console.warn` 和 `console.error` 调用，在生产环境中会造成：

- 🚫 **性能浪费**：大量非核心日志输出消耗资源
- 📊 **日志污染**：重要错误信息被淹没在调试信息中
- 💸 **成本增加**：云环境日志存储和传输成本

## 🚀 解决方案

### 1. 统一日志管理系统

我们创建了 `apps/web/middleware/lib/logger.ts`，提供：

- **分级日志控制**：ERROR(0) → WARN(1) → INFO(2) → DEBUG(3)
- **环境智能配置**：生产环境默认只记录警告和错误
- **性能优化**：生产环境自动过滤快请求(<100ms)
- **结构化日志**：统一格式，便于分析和监控
- **项目规范**：使用 `@t3-oss/env-nextjs` + `zod` 验证

### 2. 环境变量配置

在 `libs/config/src/ec-env.ts` 中已添加 `MIDDLEWARE_LOG_LEVEL` 配置：

```typescript
// 中间件日志级别控制：0=ERROR, 1=WARN, 2=INFO, 3=DEBUG
// 生产环境建议使用 1 (WARN)，开发环境使用 3 (DEBUG)
MIDDLEWARE_LOG_LEVEL: z.coerce.number().min(0).max(3).default(1).optional();
```

#### 环境配置示例

```bash
# .env.production (生产环境 - 推荐)
MIDDLEWARE_LOG_LEVEL=1  # 只记录WARNING和ERROR

# .env.staging (测试环境)
MIDDLEWARE_LOG_LEVEL=2  # 包含INFO级别日志

# .env.development (开发环境)
MIDDLEWARE_LOG_LEVEL=3  # 记录所有DEBUG信息

# 紧急调试 (问题严重时)
MIDDLEWARE_LOG_LEVEL=0  # 只记录ERROR
```

### 3. 日志级别说明

| 级别       | 场景           | 生产环境        | 示例                                 | 预期日志量\* |
| ---------- | -------------- | --------------- | ------------------------------------ | ------------ |
| `ERROR(0)` | 系统错误、异常 | ✅ 总是记录     | API 调用失败、Cookie 初始化失败      | ~10-20 条    |
| `WARN(1)`  | 警告、降级处理 | ✅ 建议保留     | 区域无效使用默认值、API 超时使用缓存 | ~50-100 条   |
| `INFO(2)`  | 重要业务逻辑   | ⚠️ 可选择性保留 | 页面重写、重定向操作                 | ~200-300 条  |
| `DEBUG(3)` | 调试信息       | ❌ 开发环境专用 | 参数解析、中间件执行流程             | ~800-1000 条 |

\*以每小时 1000 个请求为例

**💡 生产环境使用 LEVEL 1 可减少 80% 的日志输出！**

## 🔄 迁移指南

### 步骤 1：导入新的日志工具

```typescript
// ✅ 使用项目规范
import { logger } from '../lib/logger';

// ❌ 旧方式
import { NextResponse } from 'next/server';
```

### 步骤 2：替换 console 调用

```typescript
// ❌ 替换前
console.log(`[Middleware] Processing: ${pathname}`);
console.warn(`[Middleware] Invalid region: ${region}`);
console.error(`[Middleware] API failed:`, error);

// ✅ 替换后 - 结构化日志
logger.debug('Processing request', {
  middleware: 'MiddlewareName',
  pathname,
});

logger.warn('Invalid region detected', {
  middleware: 'MiddlewareName',
  region,
});

logger.error(
  'API call failed',
  {
    middleware: 'MiddlewareName',
  },
  error
);
```

### 步骤 3：性能日志优化

```typescript
// ❌ 替换前
const duration = Date.now() - startTime;
console.log(`[Middleware] Completed in ${duration}ms`);

// ✅ 替换后 - 智能过滤
const duration = Date.now() - startTime;
logger.performance('Request completed', duration, {
  middleware: 'MiddlewareName',
  pathname,
});
```

## ✅ 已完成的更新

**核心系统:**

- ✅ `logger.ts` - 统一日志管理系统
- ✅ `ec-env.ts` - 环境变量配置

**所有 Middleware 文件 (12 个):**

- ✅ `abTestMiddleware.ts` - 1 个日志调用已优化
- ✅ `categoryMiddleware.ts` - 4 个日志调用已优化
- ✅ `countrySelectMiddleware.ts` - 2 个日志调用已优化
- ✅ `homeMiddleware.ts` - 2 个日志调用已优化
- ✅ `loggerMiddleware.ts` - 6 个日志调用已优化
- ✅ `paramResolverMiddleware.ts` - 10 个日志调用已优化
- ✅ `plaMiddleware.ts` - 4 个日志调用已优化
- ✅ `rewriteMiddleware.ts` - 2 个日志调用已优化
- ✅ `saleMiddleware.ts` - 5 个日志调用已优化

**工具文件:**

- ✅ `utils.ts` - 7 个日志调用已优化
- ✅ `apiClient.ts` - 3 个日志调用已优化

## 🧪 测试验证

```bash
# 1. 开发环境测试 (应该看到所有日志)
NODE_ENV=development MIDDLEWARE_LOG_LEVEL=3 npm run dev

# 2. 生产环境测试 (应该只看到警告和错误)
NODE_ENV=production MIDDLEWARE_LOG_LEVEL=1 npm run dev

# 3. 只看错误模式 (紧急调试)
NODE_ENV=production MIDDLEWARE_LOG_LEVEL=0 npm run dev
```

## 📈 预期收益

### 生产环境性能提升

- **日志量减少**: 70-80% 的日志输出减少
- **资源节省**: 显著减少 CPU 和内存使用
- **成本降低**: 减少云环境日志存储费用

### 开发体验改善

- **清晰错误**: 重要错误不再被调试信息淹没
- **结构化**: 便于日志分析和监控
- **类型安全**: 通过 zod 验证环境变量
- **灵活控制**: 可根据需要动态调整

## 🔄 运行时动态调整

```typescript
import { logger, LogLevel } from './middleware/lib/logger';

// 临时提升日志级别进行调试
logger.setLevel(LogLevel.DEBUG);

// 检查当前日志级别
console.log('Current log level:', logger.getCurrentLevel());

// 条件日志记录
if (logger.shouldLog(LogLevel.DEBUG)) {
  const complexData = expensiveCalculation();
  logger.debug('Complex data', { data: complexData });
}
```

## 🚨 重要提醒

1. **遵循项目规范**：使用 `EcEnv.MIDDLEWARE_LOG_LEVEL` 而非直接访问 `process.env`
2. **保留关键错误日志**：确保生产环境仍然记录重要的错误信息
3. **测试验证**：在不同环境中测试日志输出是否符合预期
4. **监控调整**：根据实际使用情况调整日志级别和过滤规则
5. **类型安全**：所有环境变量通过 `zod` 验证，确保类型安全
