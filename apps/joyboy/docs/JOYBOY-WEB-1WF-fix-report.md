# JOYBOY-WEB-1WF 问题修复报告

## 问题概述

| 项目           | 详情                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| **Issue ID**   | JOYBOY-WEB-1WF                                                                  |
| **Sentry URL** | https://castlery.sentry.io/issues/7136680703/                                   |
| **错误类型**   | SyntaxError                                                                     |
| **错误消息**   | `Unexpected identifier 'Object'. Expected ']' to end a computed property name.` |
| **首次出现**   | 2025-12-23 11:21:33                                                             |
| **影响版本**   | joyboy-web@1.68.0                                                               |
| **发生次数**   | 358,720+                                                                        |
| **影响用户**   | 79,478+                                                                         |
| **状态**       | escalating                                                                      |

## 影响范围

- **主要页面**: `/au/sale/boxing-day-sale` (Boxing Day 促销页面)
- **影响市场**: AU, UK, CA, SG, US 所有生产环境
- **主要设备**: iPhone (iOS 18.7)
- **主要浏览器**: Instagram App 内置 WebView

## 实际影响评估

### 页面可用性

> ⚠️ **重要澄清**: 此错误**不会导致页面崩溃或无法使用**

错误发生在 GTM consent 脚本中，浏览器的行为是：

1. 遇到语法错误的脚本 → **跳过该脚本**
2. 继续加载页面其他内容 → **页面正常显示**
3. React/Next.js 正常 hydrate → **交互正常**

### 功能影响矩阵

| 功能            | 状态        | 说明                     |
| --------------- | ----------- | ------------------------ |
| **页面显示**    | ✅ 正常     | 无影响                   |
| **用户交互**    | ✅ 正常     | 可以点击、浏览           |
| **购买流程**    | ✅ 正常     | 可以下单                 |
| **GTM Consent** | ❌ 失败     | 默认 consent 未设置      |
| **广告追踪**    | ⚠️ 可能异常 | 转化追踪可能不准         |
| **分析数据**    | ⚠️ 可能异常 | GA4 数据可能不完整       |
| **GDPR 合规**   | ⚠️ 风险     | Consent 状态未正确初始化 |

### 优先级评估

| 风险类型      | 等级  | 说明                      |
| ------------- | ----- | ------------------------- |
| 页面可用性    | 🟢 低 | 页面正常显示和交互        |
| 购买转化      | 🟢 低 | 用户可以正常购买          |
| GTM/Analytics | 🟡 中 | 追踪数据可能不完整        |
| Consent 合规  | 🟡 中 | GDPR consent 未正确初始化 |
| Sentry 噪音   | 🟡 中 | 大量错误日志影响监控      |

### 建议修复时间

**中优先级** - 建议在合理时间内修复（1-3 天），主要原因：

1. 清理 Sentry 错误噪音，恢复正常监控
2. 确保 consent 管理功能正常工作
3. 保证广告追踪数据准确性

## 根本原因

### 问题代码位置

`libs/modules/tracking/components/src/lib/gtm-tag/gtm-tag.tsx`

### 问题代码

```tsx
// 第 54-64 行 (修复前)
<Script id={`default-consent-${id}`} strategy="beforeInteractive" type="text/javascript">
  {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {${getActualGoogleConsent()},  // ❌ 问题在这里
          wait_for_update: 2000,
      });
      gtag('set', 'ads_data_redaction', true);
      gtag('set', 'url_passthrough', true);
  `}
</Script>
```

### 技术分析

1. **`getActualGoogleConsent()` 返回的是一个 JavaScript 对象**:

```typescript
// libs/shared/privacy-kit/src/utils/consent.ts
export function getActualGoogleConsent(): GoogleConsentSchema {
  const consent = getActualCkyConsent();
  return {
    ad_storage: consent.advertisement ? 'granted' : 'denied',
    ad_user_data: consent.advertisement ? 'granted' : 'denied',
    ad_personalization: consent.advertisement ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: consent.functional ? 'granted' : 'denied',
    security_storage: consent.necessary ? 'granted' : 'denied',
  };
}
```

2. **当对象被直接插入模板字符串时，会被隐式转换为 `[object Object]`**:

```javascript
const obj = { key: 'value' };
console.log(`${obj}`); // 输出: "[object Object]"
```

3. **生成的 JavaScript 代码变成**:

```javascript
gtag('consent', 'default', {[object Object],
    wait_for_update: 2000,
});
```

4. **浏览器解析时**:
   - `[` 被解释为计算属性名 (computed property name) 的开始，如 `obj[key]`
   - 然后遇到 `object` 后的空格和 `Object]`
   - 抛出语法错误: `Unexpected identifier 'Object'. Expected ']' to end a computed property name.`

### 为什么主要在 Instagram WebView 中报告

1. Boxing Day Sale 促销链接主要通过社交媒体（Instagram）分享
2. Instagram 内置浏览器用户量大
3. 这个错误实际上会在所有浏览器中发生，但 Instagram 流量占比高

## 修复方案

### 修改文件

`libs/modules/tracking/components/src/lib/gtm-tag/gtm-tag.tsx`

### 修复代码

```tsx
/**
 * Serialize GoogleConsentSchema object to a JavaScript object literal string
 * for embedding in inline script tags.
 *
 * IMPORTANT: This must return a valid JS object literal string, NOT the raw object.
 * Using template literals with objects directly would cause [object Object] to be inserted,
 * leading to SyntaxError in the browser.
 *
 * @see JOYBOY-WEB-1WF - SyntaxError in iOS Instagram WebView caused by [object Object]
 */
const serializeGoogleConsentToJsLiteral = (consent: GoogleConsentSchema): string => {
  // Generate proper JavaScript object property assignments
  // e.g., "'ad_storage': 'granted', 'ad_user_data': 'denied', ..."
  return Object.entries(consent)
    .map(([key, value]) => `'${key}': '${value}'`)
    .join(',\n                        ');
};
```

### 修复后的代码

```tsx
<Script id={`default-consent-${id}`} strategy="beforeInteractive" type="text/javascript">
  {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
          ${serializeGoogleConsentToJsLiteral(getDefaultRegionalGoogleConsentMapping(EcEnv.NEXT_PUBLIC_COUNTRY))},
          wait_for_update: 2000,
      });
      gtag('set', 'ads_data_redaction', true);
      gtag('set', 'url_passthrough', true);
  `}
</Script>
```

### 修复后生成的 JavaScript

```javascript
gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 2000,
});
```

### 额外修改

还将 `getActualGoogleConsent()` 改为 `getDefaultRegionalGoogleConsentMapping()`，原因：

- `getActualGoogleConsent()` 尝试访问 `window` 对象
- 在 SSR (服务端渲染) 时 `window` 不存在
- 对于 `beforeInteractive` 脚本，使用基于区域的默认 consent 配置更合理

## 本地验证结果

### 复现测试

注释掉修复代码后，在本地环境 `http://localhost:7780/sg` 成功复现错误：

**控制台错误**:

```
SyntaxError: Failed to execute 'appendChild' on 'Node': Unexpected identifier 'Object'
    at eval (webpack-internal:///...next/dist/client/app-bootstrap.js:45:31)
```

**脚本内容（错误状态）**:

```javascript
gtag('consent', 'default', {
    [object Object],  // ❌ 问题代码
    wait_for_update: 2000,
});
```

### 修复验证

应用修复后，错误消失：

**脚本内容（修复后）**:

```javascript
gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 2000,
});
```

### Sentry AI (Seer) 分析确认

Sentry 内置的 AI 分析工具也确认了根因：

> **Root Cause Identified:**
> Server-side rendering injected malformed JavaScript containing the literal string `[object Object]` instead of a valid JSON string.

## 验证方法

### 部署前验证

1. 在本地运行构建，确保无编译错误
2. 检查生成的 HTML 中 GTM 脚本是否包含正确的 consent 配置
3. 控制台无 `SyntaxError: Unexpected identifier 'Object'` 错误

### 部署后验证

1. 监控 Sentry 中 JOYBOY-WEB-1WF 的发生频率应大幅下降
2. 在 Instagram App 内打开 Boxing Day Sale 页面验证正常加载
3. 检查浏览器控制台无 JavaScript 语法错误
4. 验证 GTM consent 正确初始化

## 问题引入时间

根据 CHANGELOG.md，1.68.0 版本于 2025-12-24 发布，包含以下相关变更：

```markdown
## [1.68.0](https://github.com/castlery/joyboy/compare/web-v1.67.0...web-v1.68.0) (2025-12-24)

### Features

- **consent:** [[#86evumajd] implement consent management utilities and integrate consent to conversion apis (#1102)
```

这个 consent 管理功能的引入导致了该问题。

## 总结

| 项目            | 内容                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| **根因**        | `getActualGoogleConsent()` 返回对象，被模板字符串转为 `[object Object]`               |
| **修复**        | 添加 `serializeGoogleConsentToJsLiteral()` 函数正确序列化对象                         |
| **修改文件**    | `libs/modules/tracking/components/src/lib/gtm-tag/gtm-tag.tsx`                        |
| **优先级**      | 🟡 中优先级 - 页面可用，但 GTM consent 功能异常                                       |
| **Commit 消息** | `fix(gtm): properly serialize consent object to prevent [object Object] syntax error` |

---

**报告生成时间**: 2025-12-26

**修复人**: AI Assistant
