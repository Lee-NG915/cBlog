# Fix: PriceDisplay — Server Functions cannot be called during initial render

## 错误信息

```
Error: Server Functions cannot be called during initial render. This would create a fetch waterfall.
Try to use a Server Component to pass data to Client Components instead.
    at PriceDisplay (../../libs/shared/components/src/lib/price-display/price-display.tsx:41:162)
```

## 问题根因

### 调用链

```
PriceDisplay ('use client')
  └── formatPrice  (packages/monorepo-i18n/src/lib/utils/index.ts:11)
        └── SSR 时 = formatCurrencyServer  (currency-format.server.ts, 'use server')
```

### 问题代码

**`packages/monorepo-i18n/src/lib/utils/index.ts`**

```typescript
import { formatCurrencyServer } from './currency-format.server'; // 'use server'
import { formatCurrencyClient } from './currency-format.client';

export const formatPrice = typeof window === 'undefined' ? formatCurrencyServer : formatCurrencyClient;
```

`formatPrice` 通过 `typeof window === 'undefined'` 在运行时动态选择实现：

| 环境                                  | 结果                                                             |
| ------------------------------------- | ---------------------------------------------------------------- |
| 浏览器（CSR）                         | `formatCurrencyClient`（同步，正常）                             |
| **服务端（SSR of client component）** | **`formatCurrencyServer`（`'use server'` Server Action，异步）** |

**`PriceDisplay`** 在 render 阶段直接调用：

```typescript
// price-display.tsx:62
t('price', { value: formatPrice(priceValue), showFree: priceValue === 0 && showFree });
```

SSR 阶段 `formatPrice` 是一个 Server Action（`'use server'` 标记的 async 函数），React 不允许在 render 阶段调用 Server Action，因此抛出错误。

### 为什么是 Server Action

`currency-format.server.ts` 文件顶部有 `'use server'` 指令，该指令将文件中所有导出函数标记为 Server Action。`'use server'` 的设计用途是 **客户端可以通过网络 POST 请求触发的服务端操作**，这里用于服务端工具函数在语义上没有问题（因为服务端确实需要通过 `next/headers` 读取 locale），但其副作用是：这些函数不能在 React render 阶段（包括 SSR）被调用。

## 为什么 `formatCurrencyClient` 可以直接使用

`formatCurrencyClient` 在 SSR 阶段也是安全的：

```typescript
// currency-format.client.ts
export function formatCurrencyClient(value: number | string) {
  const locale = getLocaleClient(); // SSR 时直接返回 fallbackLocale（有 typeof window 守卫）
  return formatCurrency(value, locale); // 同步 Intl.NumberFormat，无 Server Action 调用
}
```

`getLocaleClient()` 内部有 SSR 守卫：

```typescript
export function getLocaleClient(): Bcp47Locales {
  if (typeof window === 'undefined') {
    return fallbackLocale as Bcp47Locales; // SSR 直接返回，不访问 cookie
  }
  // ...
}
```

**参考**：`product-card.tsx` 已经使用 `formatCurrencyClient` 直接 import，运行正常。

```typescript
// product-card.tsx
import { formatCurrencyClient, LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
// ...
formatCurrencyClient(price); // render 里直接调用，无问题
```

## 修复方案

### 修改文件

**`libs/shared/components/src/lib/price-display/price-display.tsx`**

```diff
- import { LocalesNamespace, formatPrice, useTranslation } from '@castlery/monorepo-i18n';
+ import { LocalesNamespace, formatCurrencyClient, useTranslation } from '@castlery/monorepo-i18n';

  // render 中：
- t('price', { value: formatPrice(priceValue), showFree: priceValue === 0 && showFree })
+ t('price', { value: formatCurrencyClient(priceValue), showFree: priceValue === 0 && showFree })

- value: formatPrice(strikeThroughPriceValue),
+ value: formatCurrencyClient(strikeThroughPriceValue),
```

### SSR 行为变化说明

|     | 修复前                                                     | 修复后                                                    |
| --- | ---------------------------------------------------------- | --------------------------------------------------------- |
| CSR | `formatCurrencyClient`（按浏览器 locale）                  | `formatCurrencyClient`（按浏览器 locale，不变）           |
| SSR | `formatCurrencyServer`（按服务端 cookie locale，但会报错） | `formatCurrencyClient`（使用 `fallbackLocale`，正常渲染） |

SSR 阶段使用 `fallbackLocale` 格式化价格是可以接受的：客户端 hydration 后会重新使用正确的 locale 渲染。

## 影响范围

- 仅修改 `PriceDisplay` 组件的 import 和两处调用
- 不影响 `formatPrice` 本身的定义（其他使用 `formatPrice` 的地方不受影响）
- 不影响服务端组件中使用 `formatCurrencyServer` 的场景
