# 01 · 架构重构：Monorepo + 域分层 + 渲染策略

一句话：把按页面堆叠的 legacy，迁成「业务域横向拆 + domain/services/components 纵向分层 + Nx tag 可执行约束」，灰度共存，不停业务。

---

## DDD 在前端 Monorepo 怎么落地？业务域怎么划分？

- 口径：借鉴 DDD **边界**，不是教科书式后端 DDD；Redux Slice / Service / Component 仍在，叫 **domain-oriented modular architecture**。
- 痛点：按页面/技术类型生长 → checkout/payment 散落；页面、接口、状态、副作用、埋点混杂；Web/POS/多市场复用难。
- 横向域：`product / cart / checkout / payment / order / promotion / user / cms / search` 等。
- 纵向三层：
  - `domain`：模型、types、entities、Redux slices、业务状态
  - `services`：接口、编排、跨对象协作
  - `components`：UI、交互、页面组合
- 依赖方向：`components → services → domain → util/config`，禁止反向。
- Web 与 POS：共用 domain/services 能力，展示层与终端约束分离。
- 迁移：灰度 + 新旧共存，非一次性重写；用 Feature Flag 控风险。

### 为什么按领域拆，而不是 components/hooks/api？

- 技术目录按「长什么样」；业务改动按「是谁的事」。
- 域收敛后：ownership、影响面、协作、复用更清晰。

### domain / services / components 职责？

- domain：状态与业务事实，不依赖 UI。
- services：I/O 与用例编排，不渲染。
- components：只消费下层，不反向定义领域规则。

### 跨域用例（如下单）如何避免 domain 互相调用？

- 编排放在上层（composite / app / 用例服务），不让 domain A 直接 import domain B。
- 跨域 UI 聚合用 `composite`，不是塞进 `shared`。

### shared vs composite？

- `shared`：无业务域耦合、可被多域依赖的基础能力。
- `composite`：必须组合多域 components/services 的聚合件。
- 真案例：`shared-components` 违规依赖他域 components → 迁到 `composite-components`。

---

## Nx tag 依赖约束具体怎么配？

- 两类 tag：
  - `scope:*`：业务域（product、checkout、payment…）
  - `type:*`：分层（domain、services、components）
- 落点：各 `project.json` 打 tag；`.eslintrc` 用 `@nx/enforce-module-boundaries` + `depConstraints`。
- 额外规则举例：
  - `domain` 仅可依赖 shared-domain / util / config
  - `shared-components` 不能依赖他域 `components`
  - `base-components`（设计系统）尽量不依赖业务层
- CI/lint 违规即失败 → 边界可执行，不只靠文档。

### Nx tag 能防住什么？防不住什么？

- 能防：错误依赖方向、跨层污染、shared 越界引用。
- 防不住：错误业务抽象、过度拆包、运行时耦合、接口契约不合理。
- 结论：控制 **耦合方向**，不能声称消除耦合。

### 如何证明重构收益？

- 交付：同域改动触达文件数下降、affected 构建范围更小。
- 治理：依赖违规数、复用比例、回归范围可控。
- 成本要承认：学习曲线、跨层改动路径变长、抽象争议 → ADR + 例外机制。

### 如果重做会调哪些边界？

- 过碎/过大的域合并或再拆。
- 跨域用例编排层是否单独成包。
- payment 等长事务是否保留额外 `actions/infrastructure`。

---

## ISR + Redis / RSC / CSR：什么页面用什么策略？

决策轴：**可缓存性 × 个性化 × 交互密度 × 数据新鲜度**。

| 策略 | 典型页 | 依据 |
| --- | --- | --- |
| ISR / 静态偏静态 | Home、营销落地、部分 CMS、SEO 列表 | 公开、变更可事件失效、TTFB 敏感 |
| RSC + 服务端取数 | PLP/PDP 骨架、需 SEO 的数据页 | 少下发 JS、靠近数据、可 streaming |
| SSR / 动态 | 强依赖登录态、强实时价库但需 SEO | 请求时算，慎缓存用户态 |
| CSR | 账户、复杂筛选交互、购物车抽屉等 | 高交互、个性化、SEO 不敏感 |

- 同一路由可拆：壳 ISR/RSC，交互岛 CSR（`'use client'`）。
- 价格/库存/用户态：**不进** 或 **短 TTL / 不共享** 公共 Full Route Cache。
- 多市场：缓存维度含 region/locale/currency（详见 04）。

---

## 必考：RSC vs SSR？Server Components 数据流？hydration 成本？

### RSC vs SSR

- SSR：服务端渲染出 **HTML**，客户端通常要 **hydrate 整棵可交互树**。
- RSC：组件在服务端执行，下发 ** RSC payload + 必要 client 边界**；默认不把该组件逻辑打进 client bundle。
- 关系：Next App Router 里 RSC 常与 SSR/SSG/ISR 组合；RSC 管「组件跑在哪」，SSR 管「何时出 HTML」。

### Server Components 数据流

- 在 Server Component 内直接 `fetch` / 读 cookie / 调后端。
- 数据作为 props 传给 Client Component；敏感逻辑留服务端。
- 缓存：`fetch` cache / `revalidate` / tag；与路由 Full Route Cache 分层理解。

### hydration 成本

- 成本 ≈ 需 hydrate 的 client 子树大小 + 主线程占用 → 影响 INP/TBT。
- 手段：默认 Server；交互才 `'use client'`；减第三方脚本；避免不必要 Context 把大树变 client。
- 坑：服务端/客户端 markup 不一致 → hydration mismatch。

---

## 回答骨架（15 分钟）

1. 业务痛点：多市场多终端，改动影响面不可控。  
2. 约束：不停业、兼容 legacy、学习成本有限。  
3. 方案：可执行边界（目录 + tag + lint + Review），不是只画图。  
4. 收益：交付速度、回归范围、违规数、复用。  
5. 代价：迁移争议、ADR、例外与回滚。
