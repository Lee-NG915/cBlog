# Consent Update 晚于 Pageview 问题分析

- **日期**: 2026-04-27
- **ClickUp**: https://app.clickup.com/t/86ex0npaq
- **涉及文件**: `libs/shared/privacy-kit/`, `libs/modules/tracking/components/src/lib/gtm-tag/`

---

## Bug 描述

consent update 事件晚于 GTM pageview 触发，期望 consent update 之后再触发 GTM 事件。

---

## 原有设计意图

前端通过 reload 机制保证 default consent 的准确性：

```
用户在 banner 修改 consent
  → 页面 reload
  → beforeInteractive 脚本从 cookieyes-consent cookie 读取最新值
  → default consent = 用户当前实际状态
```

原有设计中 default consent 已经是最终值，consent update 只是对同一个值的重复确认。

---

## 触发时序

```
[0ms]     beforeInteractive
          GTM 脚本执行：
          gtag('consent', 'default', { ...cookieValue, wait_for_update: 2000 })
          GTM 开始计时，等待 consent update

[~50ms]   React Hydration 完成

[2000ms]  wait_for_update 超时
          GTM 不再等待，触发 pageview（使用 default 状态）

[2000ms+] afterInteractive 触发
          CookieYes SDK 加载完成，读取 cookie，触发 cookieyes_consent_update
          GTM 收到 consent update（pageview 已发出）
```

---

## 为什么 consent update 晚于 pageview 不影响追踪有效性

**场景 A：新用户（无 cookie）**

- default consent = 区域硬编码（SG/US/AU: all granted，UK/CA: all denied）
- CookieYes 检测到用户未做过选择 → 不触发 consent update
- GTM 收到正确的 default，pageview 状态准确，无影响

**场景 B：回访用户（有 cookie）**

- default consent = 读取 `cookieyes-consent` cookie = 用户真实选择
- CookieYes 加载后触发 consent update = 同一份 cookie 的值
- default 和 update 值完全一致，update 是幂等的重复赋值，无影响

**结论**：当前实现下，GTM 在收到 default 时已持有正确的 consent 状态，update 的时序不影响数据准确性。

---

## 为什么不把 CookieYes 提前到 beforeInteractive

consent update 由 CookieYes SDK 触发，提前意味着改为 `beforeInteractive` 加载。

CookieYes SDK 初始化时会直接操作 DOM：

- 向 `<body>` 注入 banner HTML
- 给 `<html>/<body>` 添加 class
- 修改元素属性

`beforeInteractive` 在 React hydration 之前执行，CookieYes 的 DOM 操作破坏了 SSR HTML 与客户端 Virtual DOM 的一致性。React hydration 在对比节点时发现不匹配，无法完成 reconciliation，导致：

- 页面持续处于 hydration 状态，无法进入正常的客户端渲染阶段
- 组件的 `useEffect` / `useLayoutEffect` 从未触发
- 所有依赖客户端挂载的逻辑（API 请求、数据拉取、事件绑定）完全不执行
- 页面视觉上可见但功能完全失效，表现为"冻结"在 SSR 快照

**实测验证**：将 CookieYes 改为 `beforeInteractive` 后，页面进入客户端后不发出任何接口请求，符合上述机制。

---

## 结论

本次无需做任何修复。

consent update 晚于 pageview 是当前架构下有意为之的权衡：用 reload 机制保证 default consent 的准确性，从而让 update 的时序变得无关紧要；同时把 CookieYes 保持在 `afterInteractive`，避免 hydration 问题。
