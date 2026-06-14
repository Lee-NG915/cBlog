# 维护模式使用文档

## 概述

此维护模式系统允许您临时将特定区域的所有流量重定向到维护页面。该系统使用 AWS CloudFront Functions 和 KeyValueStore 后端实现。

## 架构

维护模式系统由 2 个组件组成：

1. **CloudFront Function** - 在 Viewer Request 阶段运行，检查维护状态并重定向用户
2. **KeyValueStore** - 存储每个区域的维护状态标志（例如 `us_maintenance`、`sg_maintenance`），当期望向某个区域开启维护模式时，手动修改 KeyValueStore 中的维护状态。如：`us_maintenance:true`,将在 us 市场开启维护模式。

### 数据流

```
用户请求 → CloudFront Function → 检查 KeyValueStore → 重定向（如处于维护中）或继续
                                         ↑
                                手动修改KeyValueStore中维护状态
```

## 工作原理

### CloudFront Function 行为

1. **提取区域**：函数从 URI 中解析区域（例如 `/us/...` → `us`）
2. **读取维护状态**：查询 KeyValueStore 中的 `{region}_maintenance` 键
3. **启用时重定向**：如果值为 `'true'`，则重定向到 `/{region}/maintenance`
4. **跳过维护页面**：对 `[region]/maintenance` 的请求永远不会被重定向，以防止循环
5. **故障安全**：如果 KeyValueStore 读取失败，请求正常进行（故障开放设计）

### 区域特定配置

系统支持以下区域的区域特定维护模式：

- `us_maintenance` - 控制美国区域的维护
- `sg_maintenance` - 控制新加坡区域的维护
- `au_maintenance` - 控制澳大利亚区域的维护
- `ca_maintenance` - 控制加拿大区域的维护
- `uk_maintenance` - 控制英国区域的维护

每个区域可以独立启用或禁用。

## 配置

### CloudFront Function 信息

#### 测试环境 CloudFront Function

**名称：** `Web-Maintenance-Checker-Test`

**ARN：** `arn:aws:cloudfront::8253xxxxx615:function/Web-Maintenance-Checker-Test`

**描述：** Used to query the maintenance status and decide whether to redirect to the maintenance page
.（存储网站的维护模式配置，仅用于前端）

**环境：** 测试环境可用

#### 生产环境 CloudFront Function

**名称：** `Web-Maintenance-Checker`

**ARN：** `arn:aws:cloudfront::8253xxxxx615:function/Web-Maintenance-Checker`

**描述：** Used to query the maintenance status and decide whether to redirect to the maintenance page
.（存储网站的维护模式配置，仅用于前端）

**环境：** 生产环境可用

### KeyValueStore 信息

#### 测试环境 KeyValueStore

**名称：** `Web-Maintenance-Configuration-Test`

**ID：** `5fc226e5-d15d-47ca-8c01-3b525247110f`

**ARN：** `arn:aws:cloudfront::8253xxxxx615:key-value-store/5fc226e5-d15d-47ca-8c01-3b525247110f`

**描述：** Store the maintenance mode configuration of the web site, which is only used for the frontend.（存储网站的维护模式配置，仅用于前端）

**环境：** 测试环境可用

#### 生产环境 KeyValueStore

**名称：** `Web-Maintenance-Configuration`

**ID：** `e1d2f382-99db-4515-954d-152a50958900`

**ARN：** `arn:aws:cloudfront::8253xxxxx615:key-value-store/e1d2f382-99db-4515-954d-152a50958900`

**描述：** Store the maintenance mode configuration of the web site, which is only used for the frontend.（存储网站的维护模式配置，仅用于前端）

**环境：** 生产环境可用

### KeyValueStore 键

每个区域在 KeyValueStore 中都有自己的维护标志：

| Key              | Value                 | Description          |
| ---------------- | --------------------- | -------------------- |
| `us_maintenance` | `'true'` 或 `'false'` | 美国区域维护状态     |
| `sg_maintenance` | `'true'` 或 `'false'` | 新加坡区域维护状态   |
| `au_maintenance` | `'true'` 或 `'false'` | 澳大利亚区域维护状态 |
| `ca_maintenance` | `'true'` 或 `'false'` | 加拿大区域维护状态   |
| `uk_maintenance` | `'true'` 或 `'false'` | 英国区域维护状态     |

**当前状态：** 所有区域当前均设置为 `false`（维护模式已禁用）

## CloudFront Function 关联的分配

### `Web-Maintenance-Checker-Test`函数关联的分配

**分配 ID：** E2AUJ5TJDWERYE

**说明：** New web test cloudfront

**缓存行为：**

- `/sg/checkout*`
- `/sg/cart*`
- `/sg*`
- `/us/checkout*`
- `/us/cart*`
- `/us*`
- `/au/checkout*`
- `/au/cart*`
- `/au*`
- `/ca/checkout*`
- `/ca/cart*`
- `/ca*`
- `/uk/checkout*`
- `/uk/cart*`
- `/uk*`

**事件类型：** Viewer Request

### `Web-Maintenance-Checker`函数关联的分配

**分配 ID：** 待运维补充

**说明：**

**缓存行为：**

- 待补充

**事件类型：** Viewer Request

### 快速参考命令

#### 测试环境

```bash
# 检查当前状态
aws cloudfront describe-key-value-store --id 5fc226e5-d15d-47ca-8c01-3b525247110f

# 为美国区域启用维护模式
aws cloudfront update-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f \
  --put Key=us_maintenance,Value=true

# 为美国区域禁用维护模式
aws cloudfront update-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f \
  --put Key=us_maintenance,Value=false
```

#### 生产环境

```bash
# 检查当前状态
aws cloudfront describe-key-value-store --id e1d2f382-99db-4515-954d-152a50958900

# 为美国区域启用维护模式
aws cloudfront update-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900 \
  --put Key=us_maintenance,Value=true

# 为美国区域禁用维护模式
aws cloudfront update-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900 \
  --put Key=us_maintenance,Value=false
```

## 使用方法

### 为区域启用维护模式

**方式 1：使用 AWS 控制台**

1. 导航到 CloudFront → Key value stores
2. 选择您的维护 KeyValueStore（测试或生产环境）
3. 添加/更新键：`{region}_maintenance`，值：`true`

**方式 2：使用 AWS CLI**

测试环境：

```bash
aws cloudfront update-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f \
  --put Key=us_maintenance,Value=true
```

生产环境：

```bash
aws cloudfront update-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900 \
  --put Key=us_maintenance,Value=true
```

### 禁用维护模式

将区域的键更新为 `false`：

测试环境：

```bash
aws cloudfront update-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f \
  --put Key=us_maintenance,Value=false
```

生产环境：

```bash
aws cloudfront update-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900 \
  --put Key=us_maintenance,Value=false
```

### 检查当前状态

测试环境：

```bash
aws cloudfront describe-key-value-store \
  --id 5fc226e5-d15d-47ca-8c01-3b525247110f

# 或查询特定键
aws cloudfront get-key \
  --kvs-arn arn:aws:cloudfront::8253xxxxx615:key-value-store/5fc226e5-d15d-47ca-8c01-3b525247110f \
  --key us_maintenance
```

生产环境：

```bash
aws cloudfront describe-key-value-store \
  --id e1d2f382-99db-4515-954d-152a50958900

# 或查询特定键
aws cloudfront get-key \
  --kvs-arn arn:aws:cloudfront::8253xxxxx615:key-value-store/e1d2f382-99db-4515-954d-152a50958900 \
  --key us_maintenance
```

### 批量操作

**为所有区域启用维护模式（测试环境）：**

```bash
KVS_ID="5fc226e5-d15d-47ca-8c01-3b525247110f"

for region in us sg au ca uk; do
  echo "Enabling maintenance for ${region}..."
  aws cloudfront update-key-value-store \
    --id $KVS_ID \
    --put Key=${region}_maintenance,Value=true
done
```

**为所有区域启用维护模式（生产环境）：**

```bash
KVS_ID="e1d2f382-99db-4515-954d-152a50958900"

for region in us sg au ca uk; do
  echo "Enabling maintenance for ${region}..."
  aws cloudfront update-key-value-store \
    --id $KVS_ID \
    --put Key=${region}_maintenance,Value=true
done
```

**为所有区域禁用维护模式（测试环境）：**

```bash
KVS_ID="5fc226e5-d15d-47ca-8c01-3b525247110f"

for region in us sg au ca uk; do
  echo "Enabling maintenance for ${region}..."
  aws cloudfront update-key-value-store \
    --id $KVS_ID \
    --put Key=${region}_maintenance,Value=false
done
```

**为所有区域禁用维护模式（生产环境）：**

```bash
KVS_ID="e1d2f382-99db-4515-954d-152a50958900"

for region in us sg au ca uk; do
  echo "Enabling maintenance for ${region}..."
  aws cloudfront update-key-value-store \
    --id $KVS_ID \
    --put Key=${region}_maintenance,Value=false
done
```

## 测试

### 本地测试

您无法在本地测试 CloudFront Functions，但可以使用 CloudFront 控制台的测试功能：

1. 转到 CloudFront → Functions
2. 选择您的函数（测试环境使用 `Web-Maintenance-Checker-Test`，生产环境使用 `Web-Maintenance-Checker`）
3. 点击 "Test" 标签
4. 使用测试事件，例如：

```json
{
  "version": "1.0",
  "context": {
    "eventType": "viewer-request"
  },
  "viewer": {
    "ip": "198.51.100.11"
  },
  "request": {
    "method": "GET",
    "uri": "/us/products",
    "querystring": {},
    "headers": {},
    "cookies": {}
  }
}
```

### 生产测试

1. **为测试区域启用**：从低流量区域开始
2. **验证重定向**：访问 `https://yourdomain.com/{region}/` 并验证重定向到 `/{region}/maintenance`
3. **验证跳过**：直接访问 `https://yourdomain.com/{region}/maintenance`（不应重定向）
4. **监控日志**：检查 CloudFront 日志是否有任何错误
5. **禁用**：将标志设置回 `false`

## 重要注意事项

### 传播延迟

- **KeyValueStore 更新**：对 KeyValueStore 的更改会在几秒钟内传播到 CloudFront 边缘位置

### 性能

- **CloudFront Functions**：在 CloudFront 边缘位置以 <1ms 的速度执行
- **无源站影响**：函数在源站请求之前运行，因此维护模式不会影响源站服务器
- **高可用性**：CloudFront Functions 全球分布，延迟低

### 限制

- **KeyValueStore 大小**：每个键值对最多可以是 1KB
- **读取限制**：CloudFront Functions 对 KeyValueStore 读取有配额（请查看 AWS 文档了解当前限制）
- **故障开放设计**：如果 KeyValueStore 读取失败，流量正常进行（不重定向）

## 维护页面要求

您必须为每个区域创建一个可在 `/{region}/maintenance` 访问的维护页面。此页面应该：

1. **静态**：避免依赖后端服务
2. **可缓存**：设置适当的缓存头
3. **通知用户**：显示清晰的维护信息
4. **提供更新**：可选择链接到状态页面或社交媒体
5. **不包含重定向**：避免从维护页面本身重定向

Next.js 维护页面示例：

```typescript
// app/[region]/maintenance/page.tsx
export default function MaintenancePage() {
  return (
    <div>
      <h1>我们很快会回来！</h1>
      <p>我们正在进行定期维护。请稍后再来。</p>
    </div>
  );
}
```

## 故障排除

### 用户未被重定向

1. **检查 KeyValueStore 值**：验证键存在且值恰好是 `'true'`（字符串）
2. **等待传播**：更新后最多等待 60 秒
3. **清除 CloudFront 缓存**：使 CloudFront 分配缓存失效
4. **检查函数关联**：验证函数在 viewer-request 阶段关联
5. **查看 CloudWatch 日志**：检查函数错误

### 重定向循环

- **原因**：维护页面本身正在被重定向
- **解决方案**：函数包含对 URI 中 `/maintenance` 的检查。验证此逻辑未被修改
- **验证**：直接访问 `/{region}/maintenance` 路径 - 它应该加载而不重定向

### 所有区域都受影响

- **检查键**：验证您设置的是正确的区域特定键（例如 `us_maintenance` 而不是 `maintenance`）
- **验证逻辑**：查看 `getRegion()` 函数以确保正确提取区域

### 函数错误

- **检查语法**：CloudFront Functions 使用受限的 JavaScript 运行时
- **异步支持**：确保您使用正确的 async/await 语法
- **控制台日志**：CloudFront Functions 支持 console.log() 进行调试

## 监控

### 推荐的 CloudWatch 告警

1. **函数执行错误**：对 CloudFront Function 错误发出告警
2. **重定向率**：监控 302 状态码以检测维护模式激活
3. **KeyValueStore 限流**：对 KVS 读取限流发出告警

### 要跟踪的指标

- 函数执行时间
- 重定向到维护页面的次数
- KeyValueStore 读取延迟
- KeyValueStore 读取失败次数

## 最佳实践

1. **先测试**：始终先在测试环境测试，然后再在生产环境启用
2. **从小做起**：一次为一个区域启用维护
3. **沟通**：尽可能提前通知用户
4. **监控**：在维护窗口期间监视 CloudWatch 指标
5. **文档化**：保留启用/禁用维护模式的运行手册
6. **时间窗口**：在低流量时段安排维护
7. **回滚计划**：有快速禁用维护模式的方法
8. **状态页面**：维护独立于主站点的外部状态页面

## 安全注意事项

- **IAM 权限**：限制对 KeyValueStore 和 CloudFront Function 更新的访问
- **审计跟踪**：为所有维护模式更改启用 CloudTrail 日志记录
- **只读函数**：CloudFront Function 仅从 KeyValueStore 读取，从不写入
- **故障安全**：函数在出错时故障开放（允许流量）而不是关闭
- **环境隔离**：测试和生产环境使用独立的 KeyValueStore 以实现隔离

## 相关资源

- [AWS CloudFront Functions 文档](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)
- [CloudFront KeyValueStore 文档](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/kvs-with-functions.html)
- [CloudFront Functions 限制](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html#limits-functions)

## 支持

有关维护模式系统的问题或疑问，请联系 DevOps 团队或在您的问题跟踪系统中创建工单。
