# UTT (impact.com) Migration — GTM → Code

迁移 impact.com Universal Tracking Tag (UTT) 与 conversion 事件，从 GTM 托管改为代码托管。GTM 侧将停用对应 tag。

- **Owner**: tracking / cart-checkout
- **触发来源**: 重构 `libs/shared/components/src/lib/utt-scripts/utt-scripts.tsx`
- **官方文档**:
  - [impact.com JS Installation](https://integrations.impact.com/impact-brand/docs/javascript-installation)
  - [impact.com Consent Mode](https://integrations.impact.com/impact-brand/docs/integrate-consent-mode-on-impactcom)

---

## 1. 范围

| 事件                                                | 旧来源              | 新来源                                                     |
| --------------------------------------------------- | ------------------- | ---------------------------------------------------------- |
| UTT loader (`<script src=utt.impactcdn.com/...js>`) | GTM custom HTML tag | `next/script` in `UttInitialScript`                        |
| `ire('consent', 'default' \| 'update', ...)`        | （未配置）          | `ConsentBridge` 监听 CookieYes `advertisement` 类别        |
| `ire('identify', { customerId, customerEmail })`    | GTM                 | `IdentifyBridge` 监听 redux `selectedActiveUser`           |
| `ire('trackConversion', eventId, payload)`          | GTM                 | `tracking.listener.ts` 在 `purchasedSucceededEvent` 内调用 |

迁移范围：5 个 market（SG / AU / CA / US / UK）。当前已启用：CA, UK。

---

## 2. PR 拆分

| PR   | 状态 | 范围                                                                                                                                                                                                                                                                                                                                |
| ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR-1 | ✅   | `utt-scripts.tsx` 重构：`next/script` + ire 队列 + `ConsentBridge` + `IdentifyBridge`；保留 SHA-256 与对外签名                                                                                                                                                                                                                      |
| PR-2 | ✅   | `trackUttPurchaseConversion(order, user)` + 接入 `purchasedSucceededEvent` listener；新增 `conversionEventId` 到 feature flag payload                                                                                                                                                                                               |
| PR-3 | ✅   | SG / AU / US payload 占位条目（`scriptUrl: ''`, `conversionEventId: 0`）；`enabledRegions` 仍为 CA/UK，待 ID 齐再翻转                                                                                                                                                                                                               |
| PR-4 | ✅   | 代码侧扫描确认无残留 GTM-impact `dataLayer.push`；剩余动作转入运维 checklist                                                                                                                                                                                                                                                        |
| PR-5 | ✅   | 按 DY events trigger 范式重构：迁出 `libs/shared/utils` + `libs/shared/components`，统一收敛到 `libs/modules/tracking/`；新增 entity / events-name / utils / helpers / triggers / temp-docs 六个落位；listener 改为 `dispatch(trackUTTConversionEvent(...))`；调用方 `layout.tsx` 改为 `@castlery/modules-tracking-components` 导入 |

---

## 3. 关键文件

按 DY events trigger 范式组织，全部落在 tracking 模块下：

```
libs/modules/tracking/services/src/lib/
├── entity/utt-events.schema.ts            # trigger payload + event properties 类型
├── events-name/utt-events-name.ts         # UTT verb 常量（consent / identify / trackConversion）
├── utils/utt.util.ts                      # transport：ensureIreQueue / trackUtt
├── helpers/utt.helper.ts                  # 配置 getter + payload builder + logUTTWarn/Error
├── triggers/utt-events.trigger.ts         # 3 个 createAsyncThunk
├── temp-docs/utt.events.md                # 镜像 dy.events.md 的 schema 文档
└── listeners/tracking.listener.ts         # purchasedSucceededEvent listener — UTT 调用点

libs/modules/tracking/components/src/lib/utt-initial-script/
└── utt-initial-script.tsx                 # UttInitialScript — 通过 dispatch trigger thunks 触发 consent / identify

packages/monorepo-features/src/lib/feaures/
└── utt-impact.ts                          # 5 market 的 scriptUrl + conversionEventId
```

> **已下线**（PR-5 重构）：原 `libs/shared/utils/src/lib/utt*.ts` + `libs/shared/components/src/lib/utt-scripts/` 已删除，对应导出从 `@castlery/utils` 与 `@castlery/shared-components` barrel 中移除。所有 UTT 相关代码已统一收敛至 `libs/modules/tracking/`。

---

## 4. 上线 Checklist（按顺序）

### 4.1 数据准备（你 / 业务）

- [ ] CA `conversionEventId` 填入 `utt-impact.ts`（替换 `0`）
- [ ] UK `conversionEventId` 填入 `utt-impact.ts`
- [ ] SG `scriptUrl` + `conversionEventId` 填入
- [ ] AU `scriptUrl` + `conversionEventId` 填入
- [ ] US `scriptUrl` + `conversionEventId` 填入

### 4.2 基础设施（SRE / 平台）

- [ ] 确认 CSP `script-src` 允许 `utt.impactcdn.com`（CloudFront / WAF 层，**不在 repo 内**）
- [ ] 确认 CSP `connect-src` 允许 impact.com 的 conversion 上报域

### 4.3 GTM 侧（marketing / SEO）

- [ ] CA：暂停 UTT custom HTML tag + conversion tag
- [ ] UK：同上
- [ ] SG：同上（与 PR-3 翻转同步）
- [ ] AU：同上
- [ ] US：同上

> **顺序**：每个 market 推荐"代码 enabledRegions 翻转 → 同时关停 GTM tag"。避免 GTM 与代码同时发，造成 conversion 翻倍。

### 4.4 验证（每个 market 分别走一遍）

- [ ] DevTools Network 看到 `https://utt.impactcdn.com/{UUID}.js` 200
- [ ] `window.ire` 在客户端可用
- [ ] 登录/登出 → 一次 `ire('identify', ...)`
- [ ] CookieYes opt-out → `ire('consent', 'update', { tracking: 'denied' })`
- [ ] CookieYes opt-in → `ire('consent', 'update', { tracking: 'granted' })`
- [ ] 下一笔测试订单 → 成功页只发一次 `ire('trackConversion', eventId, ...)`
- [ ] impact.com Dashboard **End-to-End Test** 通过
- [ ] 同一 orderId 刷新成功页多次 → conversion 只发一次（由 `trackedPurchaseOrderIds` Set 保证）
- [ ] 关闭 feature flag → 无任何脚本注入、无 `ire` 调用

---

## 5. 已知设计折衷

### 5.1 SHA-256 vs 官方 SHA-1

impact.com 官方协议要求 `customerEmail = SHA-1(email)`。历史实现用 SHA-256，本次迁移**保留 SHA-256**，避免 device-graph attribution 出现空窗。

后续计划单独 PR 把两处 `hashEmail` 切到 SHA-1（建议届时一并抽到 `utt-ire.util.ts`，目前是 `utt-scripts.tsx` 与 `utt-conversion.util.ts` 各一份）。

### 5.2 `next/script` strategy = `afterInteractive`

官方推荐 UTT 放在 `<head>`。当前用 `afterInteractive`（脚本插入到 `<body>` 末尾），因为：

- 我们在 `ensureIreQueue()` 提前装好 `window.ire` 队列 stub，UTT 真正加载前的 `ire(...)` 调用都进 buffer，加载完成自动 flush —— 不依赖脚本到达时机
- `beforeInteractive` 需要把 `<Script>` 渲染到 server boundary，破坏现有 `'use client'` 结构

### 5.3 conversionEventId 走 feature flag payload，不走 env

- 与 `scriptUrl` 同源同步，一处管理
- 切换 market 不需要改 env，CI 也不用过环境变量

### 5.4 conversion 接 redux middleware，不接 success page

- success page 保持薄
- 与 FB / Pinterest / DY purchase 事件共用同一去重 Set，统一治理
- 关掉 feature flag → 整条链路自动停摆

---

## 6. 回滚方案

**优先级排序，单 PR 粒度回滚**

| 故障场景                            | 回滚动作                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 某 market UTT 脚本拉不到 / 大量 4xx | `utt-impact.ts` 把该 market 从 `enabledRegions` 移除，重新部署（< 5 分钟）                                                                  |
| conversion 重复计数                 | 立即在 GTM 重新启用对应 market 的 conversion tag —— 不，反过来：在代码端把该 market 从 `enabledRegions` 移除，让 GTM 继续承担。**不要双开** |
| 全部市场出问题                      | feature flag `UTT_IMPACT` 整个 `status: false`，所有 `ire(...)` 调用 no-op                                                                  |
| identify 把 PII 写错                | hot-fix `hashEmail` 或在 `IdentifyBridge` early-return；不需要碰 conversion 通道                                                            |

---

## 7. 监控要点（部署后 48h）

- impact.com Dashboard：conversion 数量曲线 vs GTM 关停日的对照
- Datadog/Sentry：`utt-scripts.tsx` 或 `utt-conversion.util.ts` 的 unhandled error
- DevTools Network 抽样：`/event` 上报状态码 + payload 完整性

---

## 8. FAQ

**Q: 用户没点 CookieYes 时，conversion 会发吗？**
A: 会发，但 impact.com SDK 在 `consent: denied` 状态下 natively 跳过 cookie/identifier 设置（官方文档明确）。代码端不再额外 gate，避免与 SDK 行为冲突。

**Q: SSR 时 `window.ire` 不存在会报错吗？**
A: `ensureIreQueue()` 与 `ire()` 都做了 `typeof window === 'undefined'` 检查。`UttInitialScript` 是 `'use client'` 组件，render-phase 也不访问 window。

**Q: 同一笔订单刷新两次怎么办？**
A: 两层保护：

1. `tracking.listener.ts` 的 `trackedPurchaseOrderIds` Set 拦截重复 dispatch
2. `checkout/success/page.tsx` 的 `trackedPurchaseOrderIdRef` 拦截重复 effect

**Q: UTT 脚本加载前调用 `ire('identify', ...)` 会丢吗？**
A: 不会。`ensureIreQueue()` 装的 stub 把所有调用 push 到 `window.ire.a` 数组，UTT 真正加载完成会消费这个队列。
