# Impact (UTT / Impact Radius) 集成与使用现状

> 范围：仓库当前 `abby/orp-dev` 分支的真实代码状态（worktree `abby/impact-integration-doc`）。
> 关键词搜索：`impact` / `utt` / `ire`。
> 所有结论附 `file:line` 来源，便于跳读。

---

## 1. 一句话总览

- **服务方**：Impact.com（Impact Radius / Universal Tracking Tag，简称 **UTT**）— 联盟营销 / Affiliate Tracking
- **集成范围**：只有 **CA / UK** 由前端代码直接集成；**AU / SG / US** 由 GTM 接入，仓库前端代码不参与
  - 来源：`packages/monorepo-features/src/lib/feaures/utt-impact.ts:12`
  - 文档对账：`docs/third-party-services-integrations-overview.md`（"UTT Impact" 行：CA/UK FE，AU/SG/US GTM）
- **集成形态**：客户端 SDK pixel（动态插入 `<script>`），通过全局 `window.ire(...)` 与 SDK 通信
- **前端直接上报的事件**：**仅 2 个 SDK 控制指令** — `ire('consent', ...)` 与 `ire('identify', ...)`。**没有**前端直接调用的 conversion / order 事件，那部分走 GTM

---

## 2. 模块组成（4 个文件 + 1 个 layout 接线点）


| 角色              | 文件                                                                                  | 作用                                                                           |
| --------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Feature Flag 定义 | `packages/monorepo-features/src/lib/feaures/utt-impact.ts`                          | 开关 + 各市场 `scriptUrl` payload                                                 |
| Feature 注册      | `packages/monorepo-features/src/lib/feaures/index.ts:19,42`                         | 把 `uttImpact` 接入 `FEATURES_CONFIG`                                           |
| Feature 枚举      | `packages/monorepo-features/src/lib/config/feature-name.ts:17`                      | `FeatureName.UTT_IMPACT = 'UTT_IMPACT'`                                      |
| Util            | `libs/shared/utils/src/lib/utt.util.ts`                                             | `isUttEnabled()` / `getUTTCdnUrl()`                                          |
| Util 导出         | `libs/shared/utils/src/index.ts:24`                                                 | `export * from './lib/utt.util'`                                             |
| 集成组件            | `libs/shared/components/src/lib/utt-scripts/utt-scripts.tsx`                        | 动态注入 `<script>` + 跑 SDK loader + `ire('consent')` + `ire('identify')`        |
| 组件导出            | `libs/shared/components/src/index.ts:172`                                           | `export * from './lib/utt-scripts/utt-scripts'`                              |
| **接线点**         | `apps/web/app/[deviceTheme]/[region]/[locale]/layout.tsx:7,54`                      | 在 region/locale layout 渲染 `<UttInitialScript />`                             |
| Click ID 透传     | `libs/modules/search/components/src/lib/search-view/search-view-client.tsx:132-133` | 将 `irgwc` / `irclickid` 列入 `MARKETING_PARAM_NAMES`，跨 search state 变化时保留在 URL |


---

## 3. Feature Flag 详解

文件：`packages/monorepo-features/src/lib/feaures/utt-impact.ts`

```ts
const uttImpact: Feature = {
  featureName: FeatureName.UTT_IMPACT,
  description: 'UTT Impact',
  status: true,
  enabledAppChannels: [ApplicationChannel.WEB],     // 仅 WEB（pos 不集成）
  enabledRegions: [Region.CA, Region.UK],           // 见原文件 line 12 注释：其余市场在GTM集成
  payload: {
    [Region.CA]: { scriptUrl: 'https://utt.impactcdn.com/A6142198-749e-471e-8764-c60d62dcb7da1.js' },  // line 15
    [Region.UK]: { scriptUrl: 'https://utt.impactcdn.com/A6478293-f956-4d4e-997e-3c0b19fb659c1.js' },  // line 18
  },
};
```

要点：

- `scriptUrl` 路径里的 GUID 是 **Impact 账号/合约 ID** — 不同市场账户独立
- 没有 server-side credentials；纯客户端 pixel 集成
- 没有沙盒/staging URL，三个市场（含生产）都用同一 CDN 域名 `utt.impactcdn.com`

---

## 4. Util 层：`libs/shared/utils/src/lib/utt.util.ts`

```ts
export const isUttEnabled = () =>
  featureManager.isFeatureEnabled(featureManager.featureName.UTT_IMPACT);

export const getUTTCdnUrl = () => {
  if (!isUttEnabled()) return '';
  const region = EcEnv.NEXT_PUBLIC_COUNTRY;                           // line 8
  const upperCaseRegion = region.toUpperCase() as any;
  const uttPayload = featureManager.getFeatureFlagPayload(...);       // line 10
  if (!uttPayload) return '';
  return uttPayload[upperCaseRegion]?.scriptUrl || '';
};
```

要点：

- 区域来源：`EcEnv.NEXT_PUBLIC_COUNTRY` —— **env 决定哪个 scriptUrl 被注入**
- `payload` 用大写 region key 索引（`CA` / `UK`），所以 env 必须能被 `toUpperCase()` 后命中 payload key
- 两层短路保护：feature 关闭、payload 无对应区域 → 都返回 `''`，上游据此跳过注入

---

## 5. 集成组件：`libs/shared/components/src/lib/utt-scripts/utt-scripts.tsx`

### 5.1 入口组件 `UttInitialScript`（line 37-43）

```tsx
export const UttInitialScript = () => {
  if (!isUttEnabled()) return null;        // line 38
  const uttCdnUrl = getUTTCdnUrl();
  if (!uttCdnUrl) return null;             // line 40
  return <UttIdentifyScript uttCdnUrl={uttCdnUrl} />;
};
```

- 关门两次：feature flag + URL 解析。在 AU/SG/US 上会双双 short-circuit，返回 `null`
- **不**用 React `<Script>`，而是用纯函数组件 + 内部 effect 注入 `<script>`，方便 cleanup

### 5.2 真正干活的 `UttIdentifyScript`（line 10-34）

`useEffect` 内每次 `uttCdnUrl` 或 `user` 变化都会：

1. 删除已有 `<script id="utt-initial-script">`
2. 把用户邮箱（如有）做 **SHA-256 hex 哈希**（`crypto-js/sha256` + `crypto-js/enc-hex`，line 17）
3. 创建一个内联 `<script>`，内容是 Impact 官方推荐的 SDK loader 片段 +  两行命令：
  ```js
   ire('consent', 'default', { tracking: <granted|denied> })   // 由 checkConsentGranted(['advertisement']) 决定
   ire('identify', { customerId: <user.id>, customerEmail: <sha256(email)> })
  ```
4. 追加到 `document.body`
5. cleanup 中 remove 旧 script

要点 / 注意事项：

- **Loader 是官方"五行"片段**（`ire_o` + queue array `(e[c].a)`），把 `<uttCdnUrl>` async 注入，并把 `ire` 写到 `window.ire`（参数 `c` 即 `'ire'`，参见 line 20）
- **Consent 集成**：使用 `@castlery/shared-privacy-kit` 的 `checkConsentGranted(['advertisement'])`（line 21）。consent 拒绝时只是把 `tracking: 'denied'` 透给 SDK ——**脚本本身仍然会下载并执行**，符合 IAB TCF "consent default" 用法
- **Identify 字段**：
  - `customerId`：来自 Redux `selectedActiveUser` → `user.id`，没有就传空串
  - `customerEmail`：**SHA-256(email)** 后的 hex，没有就传空串
- **副作用敏感点**：依赖 `user`，**任何 user 对象的引用变化都会重新注入脚本**。如果 user selector 不是 stable，可能频繁 re-inject。当前 selector 见 `selectedActiveUser`（来自 `@castlery/modules-user-domain`）

### 5.3 接线点：`apps/web/app/[deviceTheme]/[region]/[locale]/layout.tsx:54`

```tsx
<LocaleLayoutClient city={cityInfo} user={userData}>
  <WebDyScripts categoryOriginalPathname={categoryOriginalPathname} />
  <TermsOfUseGlobalServer />
  {children}
  <UttInitialScript />               // line 54
</LocaleLayoutClient>
```

- 放在 region/locale layout 的最末尾 —— 整站全局生效（区域决定是否真正注入）
- 仅 `apps/web` 接入；`apps/pos` 不集成（feature flag `enabledAppChannels: [WEB]`）

---

## 6. Click ID 透传

来源：`libs/modules/search/components/src/lib/search-view/search-view-client.tsx:132-133`

```ts
// Affiliate marketing
'irgwc',     // Impact Radius Global Webmaster Campaign
'irclickid', // Impact Radius Click ID
```

行为：

- 列入 `MARKETING_PARAM_NAMES`，在 PLP / search-view 的 URL 跨 state 同步时被保留，不会被 search state 清掉
- **仓库内没有显式把 `irclickid` 写入 cookie / localStorage / 上报 BE** —— 归因依赖 Impact SDK 自身读取 URL query 并持久化

---

## 7. 没有做的事（确认范围）

下面这些**在仓库里搜不到代码**，按"FE 不集成"理解，全部走 GTM 或后端：

- **没有** conversion / order 事件（搜不到 `ire('trackConversion'` / `ire('orderEvent'` 等）
- **没有** server-side 上报到 Impact（没有 BFF / route handler 触达 `impact.com` 或 `api.impact.com`）
- **没有** 把 `irclickid` 透到后端订单创建链路上（搜不到把 `irclickid` 注入下单 payload 的代码）
- **没有** AU/SG/US 的 FE 接入（feature flag `enabledRegions` 只列了 CA/UK）

→ 如果业务侧问"为什么 CA/UK 看到 ire identify，AU/SG/US 没有"，答案就是设计如此；后三者的 Impact 事件在 GTM 容器里配置。

---

## 8. Conversion 上报集成方案

### 8.1 设计原则

| 原则 | 含义 |
| --- | --- |
| **单一归因源** | `irclickid` 只在一个地方持久化（业务侧），SDK cookie 视为短生命周期缓存 |
| **触发方决定通道** | 浏览器在场 → 客户端 SDK；浏览器缺席 → 服务端 S2S |
| **失败可观测** | 上报路径必须可在 Sentry / observability 中被识别（带 `error_bucket: impact`） |
| **与 GTM 不重复** | 同一笔订单只允许一个通道发 conversion，避免双计 |

### 8.2 归因链路（点击 → 转化）

```
[Affiliate Click]                            [Order Created]                    [Conversion Fire]
       │                                            │                                   │
   ?irclickid=xxx                                   │                                   │
       ▼                                            ▼                                   ▼
 ┌──────────────┐    write     ┌────────────────────────────┐   read   ┌──────────────────────────┐
 │ Landing page │ ───────────► │  app-owned storage (cookie)│ ───────► │ trackConversion dispatcher│
 │  middleware  │              │  key: ir_click_id          │          │  (decides channel)       │
 └──────────────┘              │  ttl: 30d, SameSite=Lax    │          └────────────┬─────────────┘
                               └────────────────────────────┘                       │
                                                                                    ├─► browser: ire('trackConversion')
                                                                                    └─► server:  BE → Impact S2S API
```

要点：
- 落地时**业务自取 `irclickid` 写入 app cookie**，不依赖 SDK 自动 cookie（Safari ITP / 跨设备/清 cookie 都会让 SDK cookie 不可靠）
- 下单时把 `ir_click_id` 写入订单元数据，作为 server-side 兜底的归因载体
- conversion 触发方根据上下文路由到客户端或服务端通道

### 8.3 触发路径契约

| # | 场景 | 触发方 | 通道 | `irclickid` 来源 |
| --- | --- | --- | --- | --- |
| 1 | 用户点下单 → 浏览器同会话内拿到结果 → 上报 | 浏览器 | `ire('trackConversion', ...)` | SDK first-party cookie（业务**不参与**） |
| 2 | 同 1，但 SDK cookie 缺失（ITP / 清 cookie / 跨设备） | 浏览器 | `ire('trackConversion', { customerId, clickId })` | 业务 cookie `ir_click_id`（显式传入） |
| 3 | Webhook / 异步对账 / 状态机延后判定 | 后端 | Impact S2S API | 订单元数据里的 `ir_click_id` |
| 4 | 退款 / 调整（金额变更） | 后端 | Impact S2S API（reverse / modify） | 订单元数据 |

**关键规则**：路径 1 是默认；路径 2/3/4 都要求业务层持有 `ir_click_id`。所以**第一步必须先把 `irclickid` 持久化到业务侧**。

### 8.4 实施分层

```
apps/web
  └─ middleware.ts                          ① 解析 URL irclickid → 写入 ir_click_id cookie
  └─ app/[…]/layout.tsx                     （已有 UttInitialScript，不动）

libs/shared/utils/src/lib
  └─ ir-click-id.util.ts                    ② 读写 ir_click_id 的统一入口
                                              · readFromCookie()
                                              · writeToCookie(value, ttlDays = 30)
                                              · clear()

libs/modules/tracking/services/src/lib
  ├─ triggers/impact.trigger.ts             ③ trackConversion 调度器（路径 1/2 分流）
  └─ helpers/impact.helper.ts               ④ ire 调用封装 + consent gate + 错误上报

libs/modules/order/services（或 BFF 层）
  └─ create-order.ts                        ⑤ 下单时把 ir_click_id 注入 order metadata

apps/web BFF / route handlers
  └─ api/impact/conversion/route.ts         ⑥ 路径 3/4 的 S2S 出口（POST → Impact API）
```

### 8.5 与 GTM 的边界

仓库当前 CA/UK 已经在用 FE 集成 SDK，AU/SG/US 走 GTM。新方案保持这条边界：

- **CA/UK**：conversion 改由本方案的 dispatcher 上报（路径 1-4 全开），**关掉 GTM 容器里同名的 Impact conversion tag**（必须人工在 GTM 后台禁用，否则双计）
- **AU/SG/US**：方案不展开，仍 GTM。如果未来要扩到这三国，只需把 `enabledRegions` 加上对应市场，并在 GTM 把对应 tag 关掉

### 8.6 关键技术决策

| 决策点 | 选择 | 理由 |
| --- | --- | --- |
| `irclickid` 持久化载体 | first-party cookie（业务自管） | server-side 可读、ITP 下 30d 内有效、统一前后端访问 |
| Cookie 名 | `ir_click_id` | 与 Impact SDK 自有 cookie（`_ir_*`）解耦，命名归我们控制 |
| TTL | 30 天 | Impact 默认 cookie 窗口与多数 affiliate 合约 lookback 一致 |
| Consent gate | 沿用 `checkConsentGranted(['advertisement'])` | 与现有 `UttIdentifyScript` 一致；拒绝时不持久化、不上报 |
| 错误上报 | Sentry tag `error_bucket: impact` | 与 `libs/shared/observability` 现有约定一致 |
| 双计防御 | dispatcher 在调用前打 idempotency key（`orderId + conversionType`），同 key 跳过 | 防止 SPA 重渲染或回退/前进重复触发 |

### 8.7 验收

| 检查项 | 期望 |
| --- | --- |
| 从 `?irclickid=X` 链接落地 | 业务 cookie `ir_click_id=X` 写入，30d TTL |
| 关闭/重开浏览器后下单 | cookie 仍存在 → conversion 仍归因 |
| Safari + ITP 7d 后下单 | 业务 cookie 仍有效（first-party 30d）；SDK cookie 失效不影响归因 |
| 同一订单触发两次 trackConversion | 第二次被 idempotency key 拦截，Impact 后台只看到一次 |
| 浏览器无 consent | 既不写 cookie 也不上报，无 console / Sentry 噪音 |
| Webhook 路径触发 | BE 从订单元数据取 `ir_click_id`，S2S 上报成功，Sentry 无 `error_bucket: impact` 错误 |

### 8.8 不在本方案范围内

- Impact 商品/SKU 层维度归因（current scope: order-level）
- 跨设备归因（依赖 Impact 自家 device-graph，不在 FE 控制范围）
- 多 touchpoint 归因模型（First-click vs Last-click，由 Impact 后台配置）

---

## 9. 已知坑 / 注意事项

1. **目录名有 typo**：`packages/monorepo-features/src/lib/feaures/` 少了一个 `t`（应为 `features`）。所有 import 都指向 `feaures` —— 改名会牵动很多文件，不要顺手改。
2. **useEffect 依赖 `user` 对象**：见 §5.2。如果 `selectedActiveUser` 返回非引用稳定的对象，会高频 re-inject `<script>`，进而高频触发 `ire('identify')` 调用。需要排查时优先看 selector 是否 memoized。
3. `**checkConsentGranted` 里有 `console.log`**：`libs/shared/privacy-kit/src/utils/consent.ts:164` 残留生产 `console.log`，控制台噪音来源（与 Impact 无关，但 debug Impact 时会被它干扰）。
4. **SDK 全局污染**：loader 把 `ire` 和 `ire_o` 直接挂到 `window`。如有 SSR/CSP hardening，需要把内联 script 的 CSP nonce 处理掉（当前没有 nonce）。
5. **没有 ire 错误兜底**：`window.ire` 是 SDK loader 提供的 queue function，不会抛错；但 SDK 加载失败时调用是无声失败的，没有日志。

---

## 10. 验证清单（如果你要排查 CA/UK Impact 是否正常工作）

按下面顺序在浏览器 DevTools 验证：

1. **Feature 开启**：`window.featureManager?.isFeatureEnabled('UTT_IMPACT')` → `true`
2. **Script 已注入**：DOM 里能找到 `<script id="utt-initial-script">` 和它后面通过 loader async 加载的 `<script src="https://utt.impactcdn.com/A...js">`
3. **SDK 暴露**：`typeof window.ire === 'function'` → `true`
4. **Consent 状态**：`ire('consent', 'default', {tracking: 'granted'|'denied'})` 已在内联 script 里执行，可通过 Network 面板看 `utt.impactcdn.com` 的请求 query string 是否带上对应状态
5. **Identify 字段**：内联 script 里的 `customerEmail` 应是 64 字符 hex（SHA-256 hex 长度），不是明文
6. **Click ID**：从带 `?irclickid=xxx` 的 URL 进入站点后，再点页内链接，URL 上仍保留 `irclickid`（在 PLP / search-view 路径下可验证）

---

## 11. 参考资料

- `docs/third-party-services-integrations-overview.md` — 仓库内三方服务总览（"UTT Impact" 行）
- Impact.com 官方 UTT 文档（需登录开发者后台）：`https://app.impact.com/`（具体 doc URL 因账户而异）
- IAB TCF Consent Mode：Impact SDK 用法符合"consent default"模式 — 加载脚本不等于上报数据，由 `tracking: granted|denied` 控制

---

## 附录 A：本次调研搜索命令

```bash
# 在 worktree 根目录执行
rg -n "ire\(|ire\s*=|impactScripts|impact\.com|irclickid|UTT-Impact|utt-impact|utt_|_utt|ImpactRadius|irevs" libs apps packages
rg -n "UttInitialScript|UttIdentifyScript|UTT_IMPACT|isUttEnabled|getUTTCdnUrl" libs apps packages
rg -n "checkConsentGranted|'advertisement'" libs/shared/privacy-kit/src
```

