# DY 排序熔断器维护指南

> **⚠️ 重要**：熔断器日志在**服务端终端**（运行 `pnpm dev` 的窗口），不在浏览器控制台！  
> **快速验证**：在服务端终端搜索 `dy_circuit_breaker` 或 `dy_ranking_execution`，有日志说明熔断器在工作

## 📋 目录

- [快速验证](#-快速验证)
- [架构说明](#️-架构说明)
- [关键配置](#️-关键配置)
- [日志监控](#-日志监控)
- [故障排查](#-故障排查)
- [调优指南](#-调优指南)
- [常见问题](#-常见问题)

---

## ✅ 快速验证

### 方法 1: 本地开发验证（推荐）

> ⚠️ **关键**：日志在**服务端终端**，不在浏览器控制台！

```bash
# 1. 启动开发环境（观察这个终端窗口！）
pnpm dev

# 2. 在浏览器访问搜索页面
# http://localhost:7780/sg/search

# 3. 回到终端窗口，搜索日志
# 按 Ctrl+F 搜索: dy_ranking 或 dy_circuit_breaker

# ✅ 正常：看到 "DY ranking successfully applied"
# 🚨 异常：看到 "circuit breaker opened"
```

**实际验证（2024-10-28）**：

- ✅ URL: `http://localhost:7780/sg/search` 工作正常
- ✅ 搜索 API 返回 608 结果（57ms）
- ✅ DY cookies 已设置（dyid: 4967470635562857780）
- ✅ 代码已验证可部署

### 方法 2: 生产环境日志（Sentry）

```bash
# 在 Sentry 中搜索
context:dy_circuit_breaker OR context:dy_ranking_execution

# 有日志 = 熔断器正常工作
```

### 方法 3: 模拟故障验证

临时修改 `dy-ranking.utils.ts` 第 40-50 行：

```typescript
async function callDyApi(payload: any): Promise<any> {
  // 🧪 测试 1: 模拟超时
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 🧪 测试 2: 模拟失败
  throw new Error('Test DY API failure');

  // ... 原有代码
}
```

**预期结果**：

1. 前 3-4 个请求超时（3 秒）
2. 日志出现：`DY ranking failed with error`
3. 连续失败后：`DY API circuit breaker opened`
4. 之后请求：`DY API request rejected - circuit is open`
5. 搜索功能正常，使用 ES 原始排序

---

## 🏗️ 架构说明

### 代码位置

```
libs/modules/search/components/src/lib/api/search/
├── dy-ranking.utils.ts          # 🔴 核心实现（熔断器）
├── route.ts                      # 调用入口
└── DY_RANKING_CIRCUIT_BREAKER.md # 本文档
```

### 核心流程

```
用户搜索
    ↓
route.ts → applyDyRanking()
    ↓
检查是否需要 DY 排序（有 dyid cookie）
    ↓
dyCircuitBreaker.fire(payload)
    ↓
┌───────────────┴────────────────┐
↓                                ↓
熔断器关闭 (Closed)          熔断器打开 (Open)
↓                                ↓
调用 DY API                   立即返回 null
↓                                ↓
等待响应（最多 3s）           使用降级逻辑
↓                                ↓
返回排序结果                  ES 原始排序
```

### 降级策略

| 情况                | 行为             | 用户体验    |
| ------------------- | ---------------- | ----------- |
| DY API 正常         | 返回个性化排序   | ✅ 最佳     |
| DY API 慢（< 3s）   | 等待并返回排序   | ⚠️ 稍慢     |
| DY API 超时（> 3s） | 使用 ES 原始排序 | ⚠️ 无个性化 |
| DY API 故障（熔断） | 直接用 ES 排序   | ✅ 快速降级 |

**关键**：无论何种情况，搜索功能都正常可用。

---

## ⚙️ 关键配置

### 当前配置（dy-ranking.utils.ts L49-57）

```typescript
const breakerOptions = {
  timeout: 3000, // 请求超时（毫秒）
  errorThresholdPercentage: 50, // 错误率阈值（百分比）
  resetTimeout: 60000, // 熔断后等待恢复时间（毫秒）
  rollingCountTimeout: 10000, // 统计窗口（毫秒）
  rollingCountBuckets: 10, // 统计桶数量
  volumeThreshold: 3, // 最小请求数阈值
  name: 'dyApiBreaker', // 熔断器名称（用于日志）
};
```

### 配置详解

| 参数                       | 当前值 | 作用                    | 修改影响                                                 |
| -------------------------- | ------ | ----------------------- | -------------------------------------------------------- |
| `timeout`                  | 3000ms | 单次请求超时            | ⬆️ 增大 → 用户等待更久<br>⬇️ 减小 → 更容易超时           |
| `errorThresholdPercentage` | 50%    | 错误率超过此值时熔断    | ⬆️ 增大 → 更难触发熔断<br>⬇️ 减小 → 更容易熔断           |
| `resetTimeout`             | 60s    | 熔断后多久尝试恢复      | ⬆️ 增大 → 恢复更慢，更保守<br>⬇️ 减小 → 恢复更快，更激进 |
| `volumeThreshold`          | 3 个   | 至少 N 个请求才开始统计 | ⬆️ 增大 → 低流量时不熔断<br>⬇️ 减小 → 更敏感，易误判     |
| `rollingCountTimeout`      | 10s    | 统计窗口大小            | 影响错误率计算的时间范围                                 |
| `rollingCountBuckets`      | 10 个  | 统计窗口分成几份        | 影响统计精度（通常不改）                                 |

### 熔断器状态机

```
Closed (关闭)
    ↓ 10s 内错误率 > 50%
Open (打开) → 拒绝所有请求，立即降级
    ↓ 等待 60s
Half-Open (半开) → 测试发送 1 个请求
    ↓              ↓
  测试成功      测试失败
    ↓              ↓
  Closed         Open
 (恢复正常)    (继续熔断)
```

### ⚠️ 修改配置注意事项

1. **修改前先备份**：记录原始配置
2. **一次改一个参数**：便于观察影响
3. **在测试环境验证**：观察 1-2 周
4. **记录修改原因**：Git commit message 中说明

### 常见调整场景

| 问题                      | 可能原因             | 调整建议                       |
| ------------------------- | -------------------- | ------------------------------ |
| DY API 变慢，经常超时     | timeout 太短         | 增加到 5000ms                  |
| 误熔断（DY 正常但熔断了） | 阈值太敏感           | `errorThresholdPercentage: 70` |
| 恢复太慢                  | resetTimeout 太长    | 减少到 30000ms（30s）          |
| 低流量环境误报            | volumeThreshold 太小 | 增加到 5-10                    |

---

## 📊 日志监控

### 关键日志事件

代码中配置了 6 种日志事件（dy-ranking.utils.ts L60-87）：

| 日志消息                           | 触发时机             | 级别  | 需要处理吗？                   |
| ---------------------------------- | -------------------- | ----- | ------------------------------ |
| `DY ranking successfully applied`  | 排序成功             | INFO  | ✅ 正常，无需处理              |
| `DY API request timeout`           | 单次请求超时         | WARN  | 偶尔出现正常<br>频繁出现需排查 |
| `DY API circuit breaker opened`    | **熔断器打开**       | WARN  | **🚨 需要排查 DY API**         |
| `DY API request rejected`          | 请求被拒绝（熔断中） | WARN  | 熔断中，自动降级               |
| `DY API circuit breaker half-open` | 尝试恢复测试         | INFO  | 观察后续是否成功               |
| `DY API circuit breaker closed`    | 服务恢复             | INFO  | ✅ 故障解除                    |
| `DY ranking failed with error`     | 请求失败             | ERROR | **🚨 需排查具体错误**          |

### 日志示例与解读

#### ✅ 正常情况

```json
{
  "message": "DY ranking successfully applied",
  "rankedCount": 24, // 实际排序的商品数
  "totalCount": 24, // 总商品数
  "duration": 156, // DY API 耗时（毫秒）
  "breakerStats": {
    "failures": 0,
    "successes": 15, // 最近成功 15 次
    "timeouts": 0,
    "rejects": 0
  },
  "context": "dy_ranking_execution"
}
```

#### 🚨 熔断情况

```json
{
  "message": "DY API circuit breaker opened - too many failures",
  "stats": {
    "fires": 10, // 总请求 10 次
    "failures": 6, // 失败 6 次（60%）
    "timeouts": 3, // 其中 3 次超时
    "successes": 4,
    "rejects": 0
  },
  "context": "dy_circuit_breaker"
}
```

**解读**：10 秒内 10 次请求，6 次失败，错误率 60% > 50%，触发熔断。

#### ⚠️ 单次超时

```json
{
  "message": "DY API request timeout",
  "timeout": 3000,
  "context": "dy_circuit_breaker_timeout"
}
```

**解读**：单次请求超过 3s，使用降级。偶尔出现正常，频繁出现需排查 DY API 性能。

### Sentry 查询技巧

```
# 查看所有熔断器相关日志
context:dy_circuit_breaker

# 查看所有 DY 排序日志（包括成功和失败）
context:dy_ranking_execution OR context:dy_circuit_breaker

# 查看熔断器打开事件
message:"circuit breaker opened"

# 查看错误
level:error AND context:dy_ranking_execution
```

### 推荐告警规则

```yaml
# 1. 🚨 Critical: 熔断器持续打开超过 5 分钟
alert: DyCircuitBreakerStuckOpen
condition: |
  message:"circuit breaker opened" AND
  no message:"circuit breaker closed" within 5 minutes
severity: critical
action: |
  1. 检查 DY API 服务状态
  2. 联系 DY 支持团队
  3. 考虑临时禁用 DY 排序

# 2. ⚠️ Warning: 错误率超过 30%（可能即将熔断）
alert: DyHighErrorRate
condition: breakerStats.failures / breakerStats.fires > 0.3
severity: warning
action: 准备降级，关注是否触发熔断

# 3. ⚠️ Warning: 超时率超过 20%
alert: DyHighTimeoutRate
condition: breakerStats.timeouts / breakerStats.fires > 0.2
severity: warning
action: |
  1. 检查 DY API 响应时间
  2. 考虑增加 timeout 配置
```

### 查看实时统计

在代码中可以访问：

```typescript
const stats = dyCircuitBreaker.stats;

console.log({
  fires: stats.fires, // 总请求数
  successes: stats.successes, // 成功次数
  failures: stats.failures, // 失败次数
  timeouts: stats.timeouts, // 超时次数
  rejects: stats.rejects, // 拒绝次数（熔断时）
  isOpen: dyCircuitBreaker.opened, // 是否打开
});
```

---

## 🔧 故障排查

### 问题 1: 熔断器频繁打开

**症状**：

- 日志频繁出现 `circuit breaker opened`
- 错误率持续 > 50%

**排查步骤**：

1. **检查 DY API 服务状态**

   ```bash
   # 查看最近的 DY API 调用日志
   # 观察 response.status 和 duration
   ```

2. **查看错误详情**

   ```bash
   # Sentry 中搜索
   level:error AND context:dy_ranking_execution

   # 查看具体错误消息
   ```

3. **常见原因**：
   - DY API 服务故障 → 联系 DY 支持
   - DY API 变慢 → 考虑增加 timeout
   - 网络问题 → 检查服务器网络
   - 请求格式错误 → 检查 payload 格式

**临时解决方案**：

```typescript
// 方案 1: 增加超时（如果 DY 响应慢）
timeout: 5000,  // 改为 5s

// 方案 2: 提高错误阈值（如果误报）
errorThresholdPercentage: 70,  // 改为 70%

// 方案 3: 临时禁用 DY 排序（紧急情况）
// 在 route.ts 中注释掉 applyDyRanking 调用
```

### 问题 2: 熔断器从不打开（可能配置过于宽松）

**症状**：

- 即使 DY API 明显故障，也不熔断
- 用户体验差，等待时间长

**排查步骤**：

1. 检查配置是否过于宽松：

   ```typescript
   // 检查这些配置是否太大
   timeout: 10000,  // 太长？
   errorThresholdPercentage: 90,  // 太高？
   ```

2. 检查是否达到 volumeThreshold：
   ```typescript
   // 低流量环境可能一直达不到 3 个请求
   volumeThreshold: 3,
   ```

**解决方案**：

```typescript
// 收紧配置
const breakerOptions = {
  timeout: 3000, // 降低超时
  errorThresholdPercentage: 50, // 降低阈值
  volumeThreshold: 2, // 降低门槛（低流量环境）
};
```

### 问题 3: 熔断后无法恢复

**症状**：

- 熔断后一直是 Open 状态
- 日志显示 `half-open` 但立即回到 `open`

**原因**：DY API 持续故障

**处理**：

1. 确认这是**正常行为**（自动保护）
2. 检查 DY API 是否真的故障
3. 等待 DY 恢复，熔断器会自动恢复
4. 如果需要强制恢复：
   ```bash
   # 重启服务（熔断器状态会重置）
   pm2 restart app
   ```

### 问题 4: 日志中看不到任何 dy_circuit_breaker

**可能原因**：

1. **没有 DY 排序请求**

   - 检查是否有 `dyid` cookie
   - 检查是否启用了 DY 功能

2. **日志级别配置**

   - 检查 logger 配置是否过滤了 INFO/WARN 级别

3. **代码未部署**
   - 确认最新代码已部署

**验证**：

```typescript
// 在 applyDyRanking 函数开头添加
logger.info('DY ranking check', {
  hasDyRanking: !!dyRanking,
  hasDyId: !!dyRanking?.dyCookies?.dyid,
  skuCount: hits?.length || 0,
});
```

---

## 🎯 调优指南

### 何时需要调优？

| 指标         | 当前值      | 需要调优                   |
| ------------ | ----------- | -------------------------- |
| 平均响应时间 | > 2s        | 考虑降低 timeout           |
| 错误率       | > 10%       | 排查根本原因               |
| 熔断频率     | > 每天 5 次 | 调整阈值或修复 DY API      |
| 超时率       | > 20%       | 增加 timeout 或优化 DY API |

### 调优流程

```
1. 确定问题
   ↓
2. 分析指标（查看 breakerStats）
   ↓
3. 在测试环境调整配置
   ↓
4. 观察 1-2 周
   ↓
5. 逐步推广到生产
   ↓
6. 持续监控
```

### 按场景调优

#### 场景 1: 高流量电商站（如 Black Friday）

```typescript
const breakerOptions = {
  timeout: 2000, // 更短，快速失败
  errorThresholdPercentage: 30, // 更敏感，快速保护
  resetTimeout: 30000, // 更短，快速恢复
  volumeThreshold: 10, // 更高，避免误判
};
```

#### 场景 2: 低流量测试环境

```typescript
const breakerOptions = {
  timeout: 5000, // 更长，允许慢响应
  errorThresholdPercentage: 70, // 更宽松
  resetTimeout: 20000, // 更短，快速测试恢复
  volumeThreshold: 2, // 更低，低流量也能触发
};
```

#### 场景 3: DY API 不稳定（频繁波动）

```typescript
const breakerOptions = {
  timeout: 4000, // 稍长，容忍慢响应
  errorThresholdPercentage: 60, // 稍高，避免误熔断
  resetTimeout: 90000, // 更长，等待充分恢复
  rollingCountTimeout: 20000, // 更长窗口，平滑波动
};
```

### 调优检查清单

- [ ] 修改配置后，在测试环境模拟故障验证
- [ ] 观察 Sentry 日志 1-2 周
- [ ] 检查错误率、超时率、熔断频率
- [ ] 记录调整原因和效果
- [ ] 逐步灰度到生产（10% → 50% → 100%）
- [ ] 准备回滚方案

---

## ❓ 常见问题

### Q1: 熔断器会影响性能吗？

**A**: 几乎不会（< 1ms）。Opossum 使用高效的环形缓冲区，开销可忽略。

### Q2: DY API 完全挂了会怎样？

**A**:

1. 前 3-4 个请求会超时（每个 3 秒）
2. 触发熔断后，所有请求立即返回降级结果（0 秒）
3. 每 60 秒自动测试恢复 1 次
4. **用户始终能看到搜索结果**（使用 Elasticsearch 原始排序）

### Q3: 如何验证熔断器正在工作？

**A**:

```bash
# 方法 1: 查看生产日志
# Sentry 搜索: context:dy_circuit_breaker

# 方法 2: 本地模拟故障
# 修改 callDyApi 函数抛出错误，观察日志

# 方法 3: 查看统计
# 日志中有 breakerStats 字段
```

### Q4: 需要人工干预吗？

**A**: **不需要！** 熔断器全自动：

- 检测故障 → 自动熔断
- 等待恢复 → 自动测试
- 测试成功 → 自动恢复

只有在 **持续故障超过 1 小时** 时才需要人工排查 DY API。

### Q5: 降级逻辑是什么？

**A**:

- **正常**：使用 DY 个性化排序
- **降级**：使用 Elasticsearch 原始排序（按相关性、销量等）
- **用户体验**：可能看不到个性化推荐，但搜索功能完全正常

### Q6: Opossum 停止维护怎么办？

**A**:

- ✅ Red Hat 支持的项目，活跃维护中
- ✅ 1.5k+ stars，社区稳定
- ✅ 即使停止维护，现有代码依然可用
- ✅ 可以 fork 或切换到其他熔断器库（如 brakes）

### Q7: 如何临时禁用熔断器？

**A**:

```typescript
// 方法 1: 设置极高阈值（不推荐，失去保护）
errorThresholdPercentage: 99,

// 方法 2: 移除熔断器，直接调用（紧急情况）
// const data = await callDyApi(payload);

// 方法 3: 完全禁用 DY 排序
// 在 route.ts 中注释掉 applyDyRanking 调用
```

**⚠️ 注意**：禁用后失去保护，DY API 故障会直接影响搜索性能。

### Q8: 如何查看历史熔断记录？

**A**:

```bash
# Sentry 中搜索并设置时间范围
context:dy_circuit_breaker AND message:"opened"

# 查看最近 7 天的熔断事件
# 分析熔断频率和模式
```

---

## 📚 相关资源

### 代码

- 主实现：`libs/modules/search/components/src/lib/api/search/dy-ranking.utils.ts`
- 调用入口：`libs/modules/search/components/src/lib/api/search/route.ts`

### 文档

- Opossum 官方文档：https://github.com/nodeshift/opossum
- Circuit Breaker 模式：https://martinfowler.com/bliki/CircuitBreaker.html
- Netflix Hystrix（参考）：https://github.com/Netflix/Hystrix/wiki

### 监控

- Sentry 项目：[你的 Sentry 链接]
- 搜索关键词：`dy_circuit_breaker`, `dy_ranking_execution`

---

## 📝 变更日志

### 2024-10-28

- ✅ 初始实现
- ✅ 使用 Opossum 替代自定义熔断器
- ✅ 配置 6 种日志事件
- ✅ 添加详细文档

### 未来改进

- [ ] 集成 Prometheus 指标
- [ ] 添加自动化测试
- [ ] 配置 Grafana 面板
- [ ] 性能基准测试

---

**维护者**：如有问题，请联系搜索团队或查看上述"故障排查"章节。
