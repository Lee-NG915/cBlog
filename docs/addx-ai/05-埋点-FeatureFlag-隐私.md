# 05 · 埋点契约 / Feature Flag / 隐私

> 依据 Joyboy `master`：`docs/ai-specs/tracking`、`tracking-event-ops` skill、`redux-listener-event-design-pattern`、privacy-kit。  
> AI 改埋点流程见 [09-AI实践-Skill-Harness.md](./09-AI实践-Skill-Harness.md)。

一句话：业务成功事件 → tracking listener → 多渠道 trigger；三件套（schema/trigger/docs）版本化；Consent 做脚本闸门。

---

## Events Book：单向链路

强制流：

```
UI / service 成功
  → domain / interaction event（Redux）
  → tracking listener
  → channel trigger
  → GA / FB CAPI / Pinterest / DY / Klaviyo / UTT…
```

**禁止**：UI 直接 import 各渠道 trigger。

防的问题：

- 多入口（PDP/PLP/Cart）各写一套 SDK → 漏埋、口径漂移。  
- 改一次 ATC 要改 N 个平台。  
- 埋点失败拖垮交易主路径。

原则：

- 按 **业务动作** 组织，不按平台组织。  
- **成功后再发**（如入车成功后）。  
- 失败只日志，不阻塞加购/下单。  
- 推荐/实验上下文尽量服务端附着，客户端只触发。

### 现行代表性事件（背名字）

| 业务 | Domain Event | Listener 行为 |
| --- | --- | --- |
| ATC | `addedCartActionSucceededEvent` | cart-tracking → GA/FB/Pinterest/DY/Klaviyo fan-out |
| Purchase | `purchasedSucceededEvent` | tracking.listener → 多渠道 purchase（按 orderId 去重） |
| AddPaymentInfo | `webPaymentCapturedEvent` | FB/Pinterest 等 |

注意：

- `webAddedToCartEvent`（order domain）**不是**主 ATC 埋点，勿混淆。  
- **UTT conversion 前端派发当前注释掉**（验证未齐）——面试别说「全渠道都从前端打」。

### 渠道映射隔离

- Listener 产出统一业务语义。  
- 各 channel adapter 翻译 payload。  
- Spec：`docs/ai-specs/tracking/channels/*.events.md` + INDEX。  
- 变更：grep 下游 → **Diff Report** → 人确认 → 再改（skill 强制）。

### exactly once？

- 前端难严格 exactly once → 目标：可识别、可去重、可校验。  
- `event_id` / `order_id` / session；客户端+服务端 CAPI 用业务键去重。  
- Purchase：`trackedPurchaseOrderIds` 防重复。

### Pageview 硬规则

- 必须 `usePageViewOnce`；禁止再走 redux pageview 链。

---

## Feature Flag 三层

| 层 | 用途 | 例子 |
| --- | --- | --- |
| 业务特性 | 开闭、灰度、回滚 | 新 UI、新模块 |
| 市场差异 | AU/CA/SG/UK/US 等 | 某市场开某 tracking/支付 |
| 动态/实验 | 分流 + 实验埋点 | variant、曝光、转化 |

与普通配置：可运营、可灰度、可瞬关，不必为开关发版。

灰度迁移：关→内测/单市场→监控转化与错误→放大→异常关 Flag→删旧路径。

渠道侧 Flag 例：UTT `scriptUrl`/region、`enabledOrderV2`；Klaviyo Recently Viewed；FB 自定义 PDP 浏览等。

---

## 隐私 / Consent

权威：`docs/privacy-kit.guide.md`

- CookieYes + `CookieYesScriptGate` + `useConsent` / `checkConsentGranted`  
- **无同意不加载对应脚本**（优先于「脚本跑了但不发事件」）  
- 分类：necessary / analytics / advertisement / functional…  
- 映射 Google Consent Mode；FB/Pinterest 上报前查 advertisement consent  
- 登录/国家/语言/货币变化 → 清相关客户端缓存  

---

## tracking-event-ops（面试加分一句）

- ADD：人确认 scenario → schema→trigger→domain→listener→UI→docs  
- MODIFY：Diff Report + 人确认后再改  
- 与 multi-market / api-change-check 可联动  

---

## 高概率追问 → 要点

- 为何单向？→ 防旁路、统一口径、隔离主流程。  
- ATC 从哪触发？→ cart service 成功 dispatch → cart-tracking listener。  
- 如何保证质量？→ 契约版本化、Diff Report、consent 闸门、去重。  
- Flag vs i18n？→ Flag 管能力与风险；文案是内容配置。
