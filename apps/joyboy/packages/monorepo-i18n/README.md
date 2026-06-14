# monorepo-i18n

A internationalization (i18n) solution for Castlery's monorepo projects, built with TypeScript and React.

This library was generated with [Nx](https://nx.dev).
For technical details, please refer to: [Confluence 技术方案 - Internationalization(i18n)](https://castlery.atlassian.net/wiki/x/84BZp)

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Building](#building)
- [Running Unit Tests](#running-unit-tests)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
  - [Client-Side Usage](#client-side-usage)
  - [Server-Side Usage](#server-side-usage)
- [Translation Management](#translation-management)
  - [Translation File Structure](#translation-file-structure)
  - [Adding New Translations](#adding-new-translations)
- [Configuration](#configuration)
- [Type Safety](#type-safety)
- [Best Practices](#best-practices)
- [Format](#format)
  - [Variable Interpolation](#variable-interpolation)
  - [Number Formatting](#number-formatting)
  - [Currency Formatting](#currency-formatting)
  - [Date and Time Formatting](#date-and-time-formatting)
  - [Pluralization](#pluralization)
  - [Conditional Formatting](#conditional-formatting)
  - [Array and Object Formatting](#array-and-object-formatting)
  - [Custom Formatting Functions](#custom-formatting-functions)
- [Price Format](#price-format)

## Features

- 🎯 Type-safe translations with TypeScript
- 🌐 Support for multiple languages and regions
- 🔄 Automatic language detection
- ⚡ Server-side rendering support
- 💾 Persistent language preference
- 📦 Modular namespace organization
- 🌍 Region-specific translations (e.g., sg.json for Singapore)
- 🔍 Smart fallback handling
- 🚀 Performance optimized
- 🛠️ Developer-friendly API

## Project Structure

```
packages/monorepo-i18n/
├── src/                    # 核心源代码
│   ├── lib/               # 库实现
│   │   ├── types/         # 类型定义
│   │   ├── utils/         # 工具函数
│   │   ├── scripts/       # 脚本文件
│   │   └── settings/      # 配置设置
│   └── index.ts           # 入口文件
├── README.md              # 主文档
├── CURRENCY_GUIDE.md      # 货币指南
└── package.json           # 包配置
```

## Building

Run `nx build monorepo-i18n` to build the library.

## Running Unit Tests

Run `nx test monorepo-i18n` to execute the unit tests via [Jest](https://jestjs.io).

## Installation

```bash
npm install @castlery/monorepo-i18n
```

## Quick Start

1. Initialize i18n in your application:

```typescript
import { initI18n } from '@castlery/monorepo-i18n';

// Initialize with default options
await initI18n({ options: { lng: 'en-US' } });
```

2. Use translations in your components:

```typescript
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

function MyComponent() {
  const { t } = useTranslation(LocalesNamespace.MODULES_CART);
  return <h1>{t('cartSummary.total')}</h1>;
}
```

## Usage Guide

### Client-Side Usage

For client-side rendering, use the `useTranslation` hook:

```typescript
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

function MyComponent() {
  // Parameters: language, namespace, options
  const { t, i18n, ready } = useTranslation(LocalesNamespace.MODULES_CART, {
    keyPrefix: 'cartSummary', // Optional: prefix for translation keys
  });

  if (!ready) return <div>Loading...</div>;

  return (
    <div>
      <h1>{t('title')}</h1>
      <button onClick={() => i18n.changeLanguage('zh')}>Switch to Chinese</button>
    </div>
  );
}
```

### Server-Side Usage

For server-side rendering, use the `translationServer` function:

```typescript
import { translationServer, LocalesNamespace } from '@castlery/monorepo-i18n';

async function ServerComponent() {
  const { t } = await translationServer(LocalesNamespace.MODULES_CART, {
    keyPrefix: 'cartSummary',
  });

  return <div>{t('title')}</div>;
}
```

## Translation Management

### Translation File Structure

Add your translation files following this structure:

```
locales/
.
├── modules
│   ├── cart
│   │   ├── en-AU.json
│   │   ├── en-CA.json
│   │   ├── en-GB.json    # 注意不是en-UK,遵循 BCP 47 语言标签标准。
│   │   ├── en-SG.json
│   │   └── en-US.json
│   ├── checkout
│   │   ├── en-AU.json
│   │   ├── en-CA.json
│   │   ├── en-GB.json
│   │   ├── en-SG.json
│   │   └── en-US.json
│   └── user
│       ├── en-AU.json
│       ├── en-CA.json
│       ├── en-GB.json
│       ├── en-SG.json
│       └── en-US.json
└── shared
    ├── en-AU.json
    ├── en-CA.json
    ├── en-GB.json
    ├── en-SG.json
    └── en-US.json
```

### Adding New Translations

1. **Create Translation Files**

   Create your JSON translation files in the appropriate directory:

   ```json
   // locales/modules/cart/en-US.json
   {
     "cartSummary": {
       "title": "Cart summary",
       "total": "Total"
     }
   }
   ```

2. **Update Namespace Enum**

   Add your new namespace to `src/lib/types/namescape.ts`:

   ```typescript
   export enum LocalesNamespace {
     SHARED = 'shared',
     MODULES_USER = 'modules/user',
     MODULES_CHECKOUT = 'modules/checkout',
     // Add your new namespace here
     MODULES_CART = 'modules/cart',
   }
   ```

3. **Update Resource Types**

   Add type definitions for your translations in `src/lib/types/resource.ts`:

   ```typescript
   export type Resource = {
     [LocalesNamespace.SHARED]: SharedResource;
     [LocalesNamespace.MODULES_CHECKOUT]: CheckoutResource;
     [LocalesNamespace.MODULES_USER]: UserResource;
     // Add your new resource type here
     [LocalesNamespace.MODULES_CART]: CartResource;
   };
   ```

## Configuration

Customize i18n behavior by passing options to `initI18n`:

```typescript
import { initI18n } from '@castlery/monorepo-i18n';

await initI18n({
  options: {
    debug: true,
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'en-SG', 'en-GB', 'en-AU', 'en-CA'],
    // ... other i18next options
  },
});
```

## Type Safety

After setting up your namespaces and resource types, you'll get full TypeScript support:

```typescript
// TypeScript will provide autocomplete and type checking
const { t } = useTranslation(LocalesNamespace.MODULES_CART);
t('title'); // ✅ Type-safe
t('nonexistent'); // ❌ TypeScript error
```

## Best Practices

1. **Namespace Organization**

   - Use meaningful namespace names
   - Group related translations together
   - Keep namespaces modular and focused

2. **Translation Keys**

   - Use consistent naming conventions
   - Keep keys hierarchical and organized
   - Avoid deep nesting of keys

3. **Performance**

   - Use `keyPrefix` for better organization
   - Load translations on demand
   - Implement proper loading states

4. **Type Safety**
   - Always define resource types
   - Use TypeScript for better development experience
   - Keep type definitions up to date

## Format

The i18n library supports various formatting options for variables, numbers, dates, and currencies. Here are the most commonly used formatting patterns:

### Variable Interpolation

Use `{{variable}}` syntax to interpolate variables in your translations:

```typescript
// Translation file: en-US.json
{
  "welcome": "Hello {customerName}, Welcome to {appName}!"
}

// Usage in component
const { t } = useTranslation(LocalesNamespace.SHARED);
t('welcome', { name: 'John', app: 'Castlery' });
// Output: "Hello John, Welcome to Castlery!"
```

### Number Formatting

Format numbers with locale-specific formatting:

```typescript
// Translation file: en-US.json
{
   "quantity": "Quantity: {count, number}",
   "percentage": "Discount: {percent, number, percent}",
   "decimal": "Rating: {rating, number, ::.0#}"
}

// Usage
t('quantity', { count: 1234 });
// Output: "Quantity: 1,234" (en-US) or "Quantity: 1 234" (en-GB)

t('percentage', { percent: 0.15 });
// Output: "Discount: 15%" (en-US) or "Discount: 15 %" (en-GB)

t('decimal', { rating: 4.5 });
// Output: "Rating: 4.5"
```

### Currency Formatting

Format currency values with proper locale formatting:

**Basic Usage**

```typescript
// Translation file: en-US.json
{
  "total": "Total: {value,number,::currency/USD}" // i18next-icu的标准写法，不建议使用，因为针对市场做了自定义currency symbol，i18next-icu不支持自定义currency symbol
}

t('price', { amount: 299.99 });
// Output: "Price: $299.99" (en-US) or "Price: £299.99" (en-GB) or "Price: $299.99" (en-CA)
// Output: "Price: US$299.99" (en-US) or "Price: £299.99" (en-GB) or "Price: CA$299.99" (en-CA)
```

**Recommended Usage**

- [More Details for Price Format](#price-format)

```typescript
// Translation file: en-US.json
{
  "total": "Total: {value}"
}


// client-side: page.tsx
'use client'
import { formatPrice } from "@castlery/monorepo-i18n"

t('total', { value: formatPrice(299.99) });
// Output: "Price: $299.99" (en-US) or "Price: £299.99" (en-GB) or "Price: C$299.99" (en-CA)


// server-side: page.tsx
import { formatPrice } from "@castlery/monorepo-i18n"

t('total', { value: await formatPrice(299.99) });
// Output: "Price: $299.99" (en-US) or "Price: £299.99" (en-GB) or "Price: C$299.99" (en-CA)
```

### Date and Time Formatting

Format dates and times with locale-specific formatting:

```typescript
// Translation file: en-US.json
{
  "orderDate": "Order placed on:  {date, date}",
  "deliveryTime": "Delivery by: {date, date, long}",
}

// Usage
const orderDate = new Date('2024-01-15');
t('orderDate', { date: orderDate });
// Output: "Order placed on 1/15/2024" (en-US) or "Order placed on 15/01/2024" (en-GB)

t('deliveryTime', { date: orderDate });
// Output: "Delivery by January 15, 2024"

```

### Pluralization

Handle plural forms automatically:

```typescript
// Translation file: en-US.json
{
  "quantity": "You have {count, plural, =0 {no items} =1 {one item} other {# items}} in your cart.",
  "itemCount": "{count, plural, =1 {# item} other {# items}}",
  "productCount": "{count, plural, =0 {No products} =1 {# product} other {# products}}"
}

// Usage
t('itemCount', { count: 1 });
// Output: "1 item"

t('itemCount', { count: 3 });
// Output: "3 items"

t('productCount', { count: 0 });
// Output: "No products"
```

### Conditional Formatting

Use conditional formatting based on variables:

```typescript
// Translation file: en-US.json
{
  "status": "{status, select, pending {Pending} processing {Processing} shipped {Shipped} delivered {Delivered} other {Unknown}}",
  "notification": "{type, select, success {Success!} error {Error occurred} warning {Warning} info {Information} other {Notification}}"
}

// Usage
t('status', { status: 'shipped' });
// Output: "Shipped"

t('notification', { type: 'success' });
// Output: "Success!"

t('notification', { type: 'error' });
// Output: "Error occurred"

```

### Array Formatting

Format arrays in translations:

```typescript
// Translation file: en-US.json
{
  "list": [
    "list item1",
    "list item2",
    "list item3"
  ]
}

// Usage
t('array.list', { returnObjects: true });
// Output: ['list item1','list item2','list item3']
```

### Custom Formatting Functions

Register custom formatting functions for specific needs:

```typescript
// Register custom formatter
import { initI18n } from '@castlery/monorepo-i18n';

await initI18n({
  options: {
    interpolation: {
      format: (value, format, lng, options) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
        return value;
      }
    }
  }
});

// Translation file: en-US.json
{
  "title": "{{text, uppercase}}",
  "subtitle": "{{text, capitalize}}"
}

// Usage
t('title', { text: 'hello world' });
// Output: "HELLO WORLD"

t('subtitle', { text: 'hello world' });
// Output: "Hello world"
```

## Price Format

### Implementation details

```typescript
// Get currency configuration options for `new IntlNumber.format`
export function getCurrencyFormatOptions(currencyCode: string) {
  return {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2, // 限制小数位数, 通常默认是2位
    currencyDisplay: 'narrowSymbol', //使用缩写版symbol，symbol=>US$1,234 narrowSymbol=>$1,234
  };
}

// Step 1: Get the `currencyCode` through the `localeCurrency` third-party library
const currencyCode = localeCurrency.getCurrency(locale);

// Step 2: Get the currency options corresponding to the locale
const options = getCurrencyFormatOptions(currencyCode);

// Step 3: Get the formatted price
const price = new Intl.NumberFormat(locale, options).format(value);

// Step 4: For special currency codes, if you want to customize the currency symbol, manually format it again
const rePrice = price.replace('$', 'C$'); // CA example
```

### How To Use?

In monorepo-i18n, a `formatPrice` function is provided and made globally available. for examples:

- Example for client-side:

```typescript
'use client';
import { formatPrice } from '@castlery/monorepo-i18n';

// CA example
console.log(formatPrice(1999.0)); // Output: C$1,999
console.log(formatPrice(1999.1)); // Output: C$1,999.1
console.log(formatPrice(1999.99)); // Output: C$1,999.99
console.log(formatPrice(1999.992)); // Output: C$1,999.99
```

- Example for server-side:

```typescript
import { formatPrice } from '@castlery/monorepo-i18n';

// CA example
const price = await formatPrice(1999.0);
console.log(price); // Output:  C$1,999
```
