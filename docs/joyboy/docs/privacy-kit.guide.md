# @castlery/shared-privacy-kit 技术指南

面向 Castlery 前端（Next.js/React）的隐私合规工具包，提供 CookieYes 横幅加载、脚本拦截、同意状态查询与映射等能力。

## 何时使用

- 需要满足 GDPR/CCPA，阻断第三方跟踪脚本（GTM、GA、Meta Pixel、Klaviyo 等）直至用户同意。
- 希望在客户端按同意类别（necessary/functional/analytics/performance/advertisement/other）精细控制脚本或组件渲染。
- 需要将 CookieYes 同意状态映射到 GCM（Google Consent Mode）ad_storage、analytics_storage 等。
- 需要在不同地区提供默认拒绝策略（如 CA、UK）并允许自定义回退逻辑。

## 能力概览

- `CookieYes`：使用 `next/script` 挂载 CookieYes 横幅脚本，监听 `cookieyes_banner_load`、`cookieyes_consent_update` 事件。
- `CookieYesScriptGate`：为第三方 `<script>` 添加 `data-cookieyes` 属性，阻断直至指定类别全部获批。
- Hooks：`useConsent(category)`、`useAllConsents()`，实时读取同意状态。
- 工具函数：
  - `getActualCkyConsent()`、`checkConsentGranted(categories)` 查询同意。
  - `mappingCKYConsentToGoogleConsent()`、`getDefaultRegionalGoogleConsentMapping()`、`getActualGoogleConsent()` 将 CookieYes 状态映射到 Google Consent Mode。
  - `openConsentBanner()`、`hasConsentBeenSet()` 便捷操作与检测。

## 使用步骤

1. 配置环境

   - `NEXT_PUBLIC_COOKIEYES_ENABLED`：是否启用 CookieYes。
   - `NEXT_PUBLIC_COOKIEYES_CDN`：CookieYes CDN 脚本地址。
   - `NEXT_PUBLIC_COUNTRY`：用于区域默认同意/拒绝的回退逻辑。

2. 在全局布局加载 CookieYes

```tsx
import { CookieYes } from '@castlery/shared-privacy-kit';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <CookieYes
          onBannerLoad={(detail) => console.info('cky_banner', detail)}
          onConsentUpdate={(detail) => console.info('cky_update', detail)}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

3. 拦截第三方脚本（推荐）

```tsx
import { CookieYesScriptGate } from '@castlery/shared-privacy-kit';

// 仅在 analytics 同意后加载 GA
<CookieYesScriptGate
  categories={['analytics']}
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
  strategy="afterInteractive"
/>;

// 多分类（全部同意才执行）
<CookieYesScriptGate categories={['analytics', 'advertisement']} src="https://example.com/advanced-tracking.js" />;
```

4. 保护 React 组件渲染

```tsx
import { useConsent } from '@castlery/shared-privacy-kit';

function AnalyticsWidget() {
  const allowAnalytics = useConsent('analytics');
  if (!allowAnalytics) return null;
  return <Dashboard />;
}
```

5. 查询与映射同意状态

```ts
import { getActualCkyConsent, mappingCKYConsentToGoogleConsent } from '@castlery/shared-privacy-kit';

const consents = getActualCkyConsent();
const googleConsent = {
  ad_storage: ckyConsent.advertisement ? 'granted' : 'denied',
  ad_user_data: ckyConsent.advertisement  ? 'granted' : 'denied',
  ad_personalization: ckyConsent.advertisement ? 'granted' : 'denied',
  analytics_storage: ckyConsent.analytics ? 'granted' : 'denied',
  functionality_storage: ckyConsent.functional ? 'granted' : 'denied',
  personalization_storage: ckyConsent.functional ? 'granted' : 'denied',
  security_storage: ckyConsent.necessary ? 'granted' : 'denied',
});
```

6. 在第三方转化/事件上报前先进行 consent 校验（示例：Facebook Conversion API）

```ts
import { checkConsentGranted } from '@castlery/shared-privacy-kit';

// Facebook conversion tracking 统一入口
export function fbConversionTrack(payload: any) {
  // 仅在广告同意后发送
  if (!checkConsentGranted(['advertisement'])) return;
  // 执行 fb conversion tracking
}

// Pinterest conversion tracking 统一入口
export function pinterestConversionTrack(payload: any) {
  // 仅在广告同意后发送
  if (!checkConsentGranted(['advertisement'])) return;
  // 执行 pinterest conversion tracking
}
```

## 目录结构（关键文件）

- `libs/shared/privacy-kit/src/components/CookieYes.tsx`：加载 CookieYes 脚本，监听横幅/同意事件并输出日志。
- `libs/shared/privacy-kit/src/components/CookieYesScriptGate.tsx`：为 `<script>` 注入 `data-cookieyes`，基于类别阻断下载与执行。
- `libs/shared/privacy-kit/src/hooks/useConsent.ts`：提供 `useConsent` / `useAllConsents`，监听 `cookieyes_consent_update` 事件更新状态。
- `libs/shared/privacy-kit/src/utils/consent.ts`：同意解析、区域默认回退、Google Consent Mode 映射、横幅打开与已设置检测。
- `libs/shared/privacy-kit/README.md`、`docs/USAGE_GUIDE.md`：更详细的示例与最佳实践。

## 原理概述

- CookieYes 脚本通过环境变量配置的 CDN 加载，加载后在页面上注册 `CookieYes` 对象并分发事件。
- `data-cookieyes` 属性告知 CookieYes 阻断对应 `<script>`；同意后由 CookieYes 将脚本类型恢复执行，从而在下载前完成阻断。
- Hooks 与工具函数监听 `cookieyes_consent_update` 并优先调用 `window.getCkyConsent()`；若不可用则解析 Cookie，最后回退到区域默认配置（CA/UK 默认拒绝非必要）。
- Google Consent Mode 映射基于 CookieYes 分类到 `ad_storage` / `analytics_storage` 等键值，以便统一向 Google API 传递用户意愿。

## 常见注意事项

- 必要（necessary）类别永远为允许状态，不应被阻断。
- 第三方脚本优先使用 `CookieYesScriptGate`，React 组件用 `useConsent` 控制渲染。
- 变更分类或新增脚本后，请在隐身模式验证阻断与同意后的执行链路，并关注浏览器控制台无未授权加载。
