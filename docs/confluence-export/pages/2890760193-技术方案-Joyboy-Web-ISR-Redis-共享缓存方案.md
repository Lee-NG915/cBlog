---
confluence_id: "2890760193"
title: "技术方案 - Joyboy Web ISR + Redis 共享缓存方案"
status: current
parent_id: "2583822375"
depth: 1
domain: rendering
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2890760193
local_joyboy_doc: null
blog_post: null
---
## **1. 方案概述**

本方案旨在优化 **Next.js** 项目的缓存机制，通过 **增量静态再生（ISR）**、**Redis 共享缓存** 和 **Webhook 刷新机制** 提升页面响应速度、减轻后端负载，并确保数据的及时更新，最终实现高效的缓存管理与更新。

## **2. 系统架构**

系统包含以下主要组件：

1. - **Next.js ISR**：利用 Next.js 的增量静态再生功能实现动态更新与静态内容加载。
2. - **Redis 缓存层**：通过多实例共享缓存，确保缓存一致性和高可用性。
3. - **Webhook 刷新机制**：实现缓存的精准更新。
4. - **Storyblok 和 Knight 数据缓存**：负责内容管理与数据同步。
## **3. 缓存能力设计**

### **3.1 数据缓存**

- **缓存源**：采用 Storyblok（CMS 服务）和 Knight（数据源）作为缓存数据的来源。
- **缓存策略**：

- **Revalidate Time**：为每个数据项设置合理的刷新时间，避免缓存长期无效。
- **Cache Invalidation**：数据更新时触发缓存失效机制，确保数据与缓存一致。
### **3.2 页面缓存**

- **缓存层级**：

- 不同页面布局（如 Layout A/B/C）独立设置缓存。
- 使用错误页面机制（Error Page）处理布局或数据错误。
- **缓存更新机制**：

- 采用 ISR 动态刷新缓存。
- 利用 Redis 存储页面生成结果，加速后续访问。
## **4. Redis 共享缓存实现**

![](attachment)

### **4.1 设计核心点**

1. - **区域隔离：**

- 每个区域（如 **sg**、**us**、**au**）都有独立的 **Next.js** 服务和 Redis 缓存。
- 每个区域的缓存完全独立，避免区域间内容干扰。
- 用户请求会由区域对应的 **Next.js** 实例处理，并使用该区域的 Redis 进行缓存管理。
2. - **环境隔离：**

- 在测试（test）环境和生产（uat/prod）环境中，Redis 是分离的：

- **test** 环境中的缓存仅用于测试，不会影响生产环境。
- **uat/prod** 环境的 Redis 缓存用于实际用户访问，确保稳定和快速的内容交付。
3. - **Next.js ISR 与 Redis 交互：**

- **ISR（增量静态再生）** 在每个区域的 **Next.js** 服务中运行，依赖 Redis 缓存：

- 页面级缓存和数据级缓存都存储在 Redis 中。
- 当页面缓存失效时，**Next.js** 会先检查 Redis 中的数据缓存。
- 如果数据缓存也过期，则通过接口请求后端获取数据，重新生成页面。
4. - **缓存管理组件：**

- 每个 **Next.js** 服务中都有一个 **cache-handler**，负责管理页面缓存和数据缓存的逻辑。
- **cache-handler** 是 ISR 和 Redis 的桥梁，负责：

- 检查缓存是否命中。
- 根据数据缓存的过期情况强制刷新页面缓存。
- 将新生成的页面和数据存入 Redis。
### **4.2 优点**

1. - **高性能缓存：**

- 使用 Redis 作为共享缓存，提升页面加载速度，减少对后端的压力。
- 在 Redis 中存储页面缓存和接口数据缓存，可以减少重复计算。
2. - **区域化支持：**

- 每个区域的服务和缓存独立，适配不同的内容和业务需求。
- 避免跨区域的内容干扰，例如 **sg** 用户访问不会影响 **us** 或 **au** 的缓存。
3. - **环境隔离：**

- 测试和生产环境的缓存独立，确保测试不会对生产内容造成影响。
- 生产环境专注于实际用户请求，提供稳定的缓存服务。
4. - **动态页面与数据更新：**

- **ISR** 确保静态页面的更新在 Redis 缓存中可快速反映。
- 接口级的数据缓存刷新会触发相关页面的缓存更新，保证页面的实时性。
### **4.3 Redis 配置**

- **集群架构**：

- 配置多实例 Redis 集群（如 Sentinel 或 Cluster 模式），保证高可用性。
- 支持分布式部署，提升扩展性。
- **缓存版本管理**：

- 使用 `env + buildId` 标识缓存版本，避免版本冲突。
- 更新版本时，通过 Webhook 批量刷新缓存。
### **4.4 缓存管理**

- **过期策略**：

- 使用动态 TTL（过期时间）调整缓存有效期，依据页面热度动态设置。
- 配合 LRU（Least Recently Used）算法淘汰低优先级缓存数据。
- **监控与报警**：

- 使用 datadog 对 Redis 缓存的命中率、内存使用量、过期清理等关键指标进行实时监控。
## **5. Webhook 刷新机制**

Webhook 机制用于从外部服务（如 Storyblok）接收数据更新通知，并根据更新内容触发缓存清理和重新验证。以下是 Webhook 流程和缓存更新的详细实现：

### **5.1 Webhook 逻辑**

1. - **签名验证**：

- Webhook 请求首先提取 `webhook-signature` 和请求体（payload）。
- 使用 HMAC-SHA1 算法对请求体生成签名，确保请求来源的可靠性。
- 若签名验证失败，拒绝继续处理请求并返回错误响应。
```
const getSignature = (body: any) => createHmac('sha1', EcEnv.NEXT_PUBLIC_STORYBLOK_WEBHOOK_SECRET || 'secret') .update(body) .digest('hex');
```

1. - **路径匹配与处理**：

- **布局路径匹配**（`/sg/pla/pla-layout-a`）：通过正则表达式从 `full_slug` 中提取国家和布局类型，当路径匹配时，执行以下操作：

- 校验国家是否与当前服务器相同，若不同则转发请求到目标国家的 Webhook。
- 使用 `revalidatePath` 清理指定路径的缓存。
- 使用 `revalidateTag` 重新验证与布局相关的所有标签。
- **数据桶路径匹配**（`pla-data-bucket/abc123`）：提取特定的数据桶 `slug`，并基于此进行缓存更新，更新数据和相应的标签。
```
const regexLayout = /^([a-z]{2})\/pla\/(pla-layout-[a-z])$/; const regexBucket = /pla-data-bucket\/([a-z0-9-]+)/;
```

1. - **请求转发**：

- 当请求涉及其他国家时，代码会将 Webhook 请求转发到目标国家的 Webhook 地址，以确保跨地区的缓存同步。
```
const targetWebhookUrl = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${country}/api/storyblok`; await forwardRequest(targetWebhookUrl, payload, request.headers);
```

1. - **缓存更新**：

- 使用 `revalidatePath` 清理缓存路径。
- 使用 `revalidateTag` 更新相关的标签缓存。
```
revalidatePath(`/[device]/${countryCode.toLocaleLowerCase()}/${defaultRegion}/(pla)/pla/[slug]/${layout}`); validateStorySlug?.forEach((slugTag) => { revalidateTag(slugTag); });
```

1. - **错误处理**：

- 若发生异常，使用 **Sentry** 进行错误捕获，便于调试和跟踪问题。
- 返回失败响应时，系统会继续展示上次成功生成的页面。
```
Sentry.captureException(err); return new Response('Error revalidating', { status: 500 });
```

### **5.2 Webhook 时序图**

```
sequenceDiagram
    autonumber
    participant CMS as CMS 平台 (Webhook 端)
    participant NextAuth as Next.js (ISR)
    participant Redis as Redis 缓存
    participant Backend as 后端服务器
    participant TargetWebhook as 目标国家 Webhook

    CMS->>+NextAuth: 发送 Webhook 请求，包含数据更新信息
    NextAuth->>+NextAuth: 验证请求签名
    NextAuth-->>-CMS: 签名验证失败，返回错误

    NextAuth->>+NextAuth: 解析请求路径 (布局路径或数据桶路径)
    NextAuth->>+Redis: 检查缓存是否命中
    Redis-->>-NextAuth: 如果命中，强制清除缓存

    NextAuth->>+Redis: 强制更新缓存并请求后端生成静态页面
    Backend->>+NextAuth: 后端返回数据，生成新的静态页面
    NextAuth->>+Redis: 将生成的静态页面缓存到 Redis
    Redis-->>-NextAuth: 缓存存储成功

    NextAuth->>NextAuth: 执行强制缓存更新，触发 `revalidatePath` 和 `revalidateTag`
    NextAuth->>+Backend: 检查并更新相关数据
    Backend-->>-NextAuth: 返回更新后的数据

    NextAuth->>+TargetWebhook: 如果需要，转发请求到目标国家 Webhook
    TargetWebhook-->>-NextAuth: 目标国家 Webhook 处理请求

    NextAuth->>+Redis: 更新目标国家的缓存
    Redis-->>-NextAuth: 缓存更新成功

    NextAuth-->>-CMS: 完成缓存更新，返回成功响应
```

### **5.3 请求转发与缓存更新**

- **请求转发**：

- 当 Webhook 请求为其他国家设置时，会识别对应国家并转发请求到相应的 Webhook 地址，确保缓存同步。
- **缓存更新**：

- 使用 `revalidatePath` 清理缓存路径。
- 使用 `revalidateTag` 更新相关的标签缓存。
### **5.4 安全性**

- **签名验证**：采用 `HMAC-SHA1` 算法结合 Webhook 密钥进行签名验证，确保数据来源的可信度。
- **HTTPS**：所有 Webhook 请求和数据传输均通过 HTTPS 加密，避免数据泄露和篡改。
## **6. 增量静态再生（ISR）方案设计**

### **6.1 ISR 原理**

ISR 机制通过 Next.js 实现：

1. - 页面首次访问时生成静态页面并缓存。
2. - 在设置的 `Revalidate Time` 后，自动更新静态页面，保证页面数据的新鲜度。
3. - 使用 Redis 存储缓存，加速后续访问。
```
sequenceDiagram
    autonumber
    participant User as 用户
    participant NextAuth as Next.js (ISR)
    participant Redis as Redis 缓存
    participant Backend as 后端服务器

    User->>+NextAuth: 请求页面
    NextAuth->>+Redis: 检查页面缓存是否命中
    Redis-->>-NextAuth: 如果页面缓存命中，返回缓存内容

    NextAuth->>+Redis: 如果页面缓存未命中，检查接口数据缓存是否命中
    Redis-->>-NextAuth: 如果接口数据缓存命中，返回数据
    NextAuth->>+Backend: 若无缓存则请求最新接口数据
    Backend-->>-NextAuth: 返回最新数据
    NextAuth->>+Redis: 更新页面缓存及数据缓存
    Redis-->>-NextAuth: 缓存存储成功
    NextAuth->>User: 返回生成的页面内容

    %% 数据缓存影响页面缓存
    Note over User, Backend: 数据缓存是影响页面缓存的因素。数据缓存的更新会导致页面缓存失效，触发重新生成页面。

    %% 页面缓存和数据缓存的独立性
    Note over Redis: 页面缓存和数据缓存可设置不同过期时间。
```

### **6.2 ISR 实现步骤**

1. - **页面请求**：当页面被请求时，首先检查 Redis 缓存是否命中。
2. - **缓存命中**：如果 Redis 缓存中有数据，直接返回缓存内容，避免重新请求。
3. - **缓存未命中**：如果缓存未命中，则请求后端数据并生成静态页面，同时将页面和数据存入 Redis 缓存。
4. - **增量更新**：在设置的缓存周期内（例如 60 秒），Next.js 将自动触发 ISR 机制重新生成页面，在此期间会返回客户端对应已过期页面。
### **6.3 缓存优化**

- 每次更新时，通过 Webhook 清理或更新相关缓存，确保数据的时效性和一致性。
## **7. PLA 页面布局的缓存控制**

### **7.1 Layout A、B 缓存**

为不同布局页面（Layout A/B）设计独立缓存策略：

- 设置独立的 TTL 和更新策略。
- 在布局错误时，跳转到 `Error Page`。
### **7.2 缓存数据一致性**

- **数据隔离**：页面和 CMS 数据相互独立，避免 CMS 数据的变动影响页面的正常显示。
- **错误处理**：当页面布局出现错误时，自动跳转到错误页面，避免错误影响用户体验。
## **8. 技术选型**

- **Redis**：用于数据缓存和页面缓存，保证高效、低延迟的缓存机制。
- **Next.js ISR**：增量静态再生机制，确保页面更新不影响性能。
- **Storyblok**：作为 CMS 提供内容管理，结合 Redis 实现高效的内容缓存。
- **Knight**：作为数据源，与 Redis 结合提供数据缓存支持。
## **9. 实施计划**

### **9.1 阶段一：缓存基础设施搭建**

1. - 配置 Redis 集群，确保多个实例共享缓存。
2. - 配置 Next.js ISR 功能，确保页面缓存和数据缓存分离管理。
3. - 配置 Webhook 接口，监听数据更新通知并触发缓存刷新。
### **9.2 阶段二：数据源接入与缓存优化**

1. - 将 Storyblok 和 Knight 数据源接入缓存系统，确保数据缓存的准确性和实时性。
2. - 优化缓存 TTL 和过期策略，保证数据的时效性。
### **9.3 阶段三：缓存监控与故障恢复**

1. - 配置缓存监控，确保缓存系统的健康和稳定。
2. - 实现缓存失效机制，并在出现异常时提供故障恢复能力（LRU: pod 级别内存缓存）。
## **10. 总结与展望**

通过引入 Redis 共享缓存和 Webhook 刷新机制，我们可以大幅提升 Next.js 项目的缓存性能与数据更新能力。此方案能够有效减轻后端负载、提升页面响应速度，并确保数据一致性。