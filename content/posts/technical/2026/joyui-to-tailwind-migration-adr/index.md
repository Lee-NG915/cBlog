---
title: ADR：从 CSS-in-JS 迁移至 Tailwind CSS 的架构决策
slug: joyui-to-tailwind-migration-adr
date: 2026-05-18
updatedAt: 2026-05-27
category: technical
tags:
  - ADR
  - Tailwind CSS
  - Design System
  - React Server Components
  - Performance
status: published
excerpt: 记录从 MUI Joy UI 迁移至 Tailwind CSS 的架构决策：RSC 与 CSS-in-JS 的运行时冲突、方案对比、渐进式迁移策略，以及谁该在什么时候推动这类基础设施变更。
---

# 前言

这是一份架构决策记录（ADR），复盘我为什么推动组件库从 MUI Joy UI 迁移到 Tailwind CSS。

背景是平台架构重构——消费者端切到 Next.js App Router + React Server Components，组件库需要同步演进。Joy UI 在业务功能上跑得不错，但在 RSC 架构下暴露了结构性问题：运行时样式、强制客户端边界、包体积膨胀。这不是「换个 CSS 框架」的审美选择，而是架构约束倒逼的技术决策。

我撰写了这份 ADR 并在团队内推进讨论。最终结论：**Radix UI + Tailwind CSS + CVA（class-variance-authority）** 替代 Joy UI，渐进式迁移，Feature Flag 控制回滚。

---

## 阅读主线

这篇适合回答「为什么从 CSS-in-JS 迁到 Tailwind」和「组件库如何兼容 RSC」。主线不是审美偏好，而是运行时样式、客户端边界、bundle 成本和缓存稳定性共同推动的架构决策；结尾要强调渐进迁移和可回滚。

## 决策背景

### 触发条件

| 信号 | 具体表现 |
| --- | --- |
| RSC 推广受阻 | 大量「纯展示」组件被迫加 `'use client'`，只为样式 |
| 性能指标压力 | 移动端 TBT 偏高，CSS-in-JS 运行时占 ~25KB |
| ISR 缓存异常 | 动态样式哈希导致 RSC payload 缓存命中率下降 |
| 上游维护放缓 | Joy UI 对 RSC / Server Actions 的支持长期搁置 |

### 不迁移的代价

- 每个新页面都在扩大客户端 Bundle
- 服务端组件的优势（零 JS 展示层）无法发挥
- 组件库和 App Router 架构持续拧巴，新同学学习成本高

---

## 现状问题分析

### 1. RSC 架构冲突

Joy UI 的样式生成依赖运行时 theme 上下文：

```jsx
// CSS-in-JS 强制的客户端边界
'use client';
function StyledCard() {
  const theme = useTheme();
  return <Box sx={{ color: theme.palette.primary.main }}>...</Box>;
}

// RSC 理想的拆分
async function ProductPage() {
  const data = await fetchProduct(); // 服务端
  return (
    <div className="text-primary">
      <AddToCartButton productId={data.id} /> {/* 仅交互在客户端 */}
    </div>
  );
}
```

核心矛盾：**静态样式也需要客户端 Bundle**。一个只展示价格、不需要交互的组件，因为用了 `sx` prop，就不得不变成 Client Component。

### 2. 布局层的 Provider 污染

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* ThemeProvider 必须是 client component */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

整个应用的 React 子树都在 ThemeProvider 之下，RSC 的选择性水合空间被大幅压缩。

### 3. 性能开销

CSS-in-JS 在浏览器端需要：

| 操作 | 典型耗时 |
| --- | --- |
| 解析 theme 对象 | ~2ms |
| 样式插值计算 | ~1-3ms |
| 生成唯一类名 | ~0.5ms |
| 注入 style 标签 | ~1-2ms |

单个组件不多，但一个 PDP 页面几十个组件累加，TBT 肉眼可见地涨。

### 4. 缓存效率

RSC payload 里如果包含动态生成的 `className`（如 `css-1234567`），不同渲染批次可能产出不同哈希，导致 ISR / 共享缓存命中率下降。这在多实例部署下尤其麻烦——同一页面在不同 Pod 上可能生成不同的样式 ID。

---

## 方案对比

### 评估维度

| 维度 | 权重 | 说明 |
| --- | --- | --- |
| RSC 兼容性 | 高 | 能否让展示层留在服务端 |
| 运行时开销 | 高 | 零运行时 CSS 优先 |
| 包体积 | 中 | 影响 FCP / TBT |
| 定制灵活性 | 中 | 电商品牌视觉差异大 |
| 迁移成本 | 中 | 存量组件数量可观 |
| 社区与维护 | 低 | 长期可维护性 |

### 候选方案

| 方案 | 优势 | 劣势 | 结论 |
| --- | --- | --- | --- |
| 保留 Joy UI | 零迁移成本 | RSC 不兼容，性能瓶颈无解 | ❌ 否决 |
| MUI Core v6 | 组件全、社区活跃 | 仍是 CSS-in-JS，RSC 支持不完整 | ❌ 否决 |
| Chakra UI | 可访问性好 | 运行时 theme，同类问题 | ❌ 否决 |
| NextUI | 原生 Tailwind、RSC 友好 | 企业级组件不够全 | ⚠️ 备选 |
| **Radix + Tailwind + CVA** | 零运行时、完全可控、RSC 友好 | 需要自建组件层 | ✅ 采纳 |

### 推荐方案：Radix UI + Tailwind CSS

**Radix** 提供无样式、可访问性完备的原语（Dialog、Dropdown、Tabs 等）。

**Tailwind** 提供构建时原子化 CSS，零运行时。

**CVA** 管理组件 variant（size、color、state），保持 API 一致性。

```tsx
// 构建时生成 CSS，零运行时开销
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

// 展示组件 — 可以是 Server Component
function Button({ className, variant, size, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```

### 主题系统

用 CSS Variables 替代运行时 theme 对象：

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
}

[data-theme='dark'] {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

```javascript
// tailwind.config 引用 CSS Variables
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--primary))',
      border: 'hsl(var(--border))',
    },
  },
}
```

服务端和客户端读同一份 CSS 变量，不需要 Provider 传递 theme 对象。

---

## 迁移策略

### 渐进式，不要大爆炸

| 阶段 | 周期 | 内容 |
| --- | --- | --- |
| 基础设施 | 2 周 | Tailwind 配置、ESLint 插件、CSS Variables 主题、Radix 原语引入 |
| 原子组件 | 4 周 | Button、Input、Typography、Card 等基础件 |
| 业务模式组件 | 6 周 | ProductCard、PriceDisplay、CartItem 等 |
| 页面级替换 | 持续 | 按页面 Feature Flag 切换新旧组件 |

### 共存与回滚

```bash
# 环境变量控制 UI 版本
NEXT_PUBLIC_UI_VERSION=new   # 或 legacy

# 回滚：改环境变量 + 重新部署，不需要回滚代码
```

新旧组件库短期共存，通过 Feature Flag 按页面切换。出问题时分钟级回滚到 legacy UI。

### 设计 Token 对齐

迁移不是「把 sx 翻译成 className」就完事。我同步推进了 Token 分层重建——色彩、间距、圆角、字重全部映射到 Tailwind config 和 CSS Variables，保证新旧组件库视觉一致。这部分在 [组件库 CDD 实践](/posts/design-system-cdd-practice/) 里有更完整的复盘。

---

## 风险与缓解

| 风险 | 缓解措施 |
| --- | --- |
| 视觉回归 | Chromatic 视觉回归测试覆盖核心组件 |
| 团队学习成本 | Tailwind 语法培训 + 组件 Storybook 示例 |
| 第三方组件兼容 | Radix 提供底层原语，上层自己封装 |
| 迁移周期长 | Feature Flag 按页面切换，不影响未迁移页面 |
| 性能不达预期 | 设定 FCP / TBT 基线，每阶段对比 PageSpeed |

### 性能目标

| 指标 | 迁移前 | 目标 |
| --- | --- | --- |
| JS Bundle | ~850KB | ~520KB（-40%） |
| CSS | ~120KB | ~90KB（-25%） |
| FCP | ~2200ms | ~1500ms |
| TBT | ~350ms | ~210ms |

---

## 决策结论

**采纳 Radix UI + Tailwind CSS + CVA 方案，替代 Joy UI。**

核心理由：

1. **架构契合**——零运行时 CSS 是 RSC 的正确搭档，不是妥协
2. **性能可量化**——Bundle 和 TBT 有明确的优化空间
3. **可控性**——组件源码在团队手里，不依赖上游 theme 系统
4. **可渐进**——Feature Flag 让迁移风险可控

否决保留 Joy UI 的理由很简单：在 RSC 架构下，CSS-in-JS 不是「能用就行」的问题，而是每天都在消耗性能预算和开发体验。

---

## 复盘

迁移推进半年后，有几点体会：

1. **ADR 的价值在于约束讨论范围**——团队不再反复争论「要不要换」，而是聚焦「怎么换」
2. **Token 对齐比组件翻译更费时**——色彩体系、暗色模式、间距标尺要先统一，否则迁移出的组件视觉不一致
3. **Radix 省了很大 Accessible 工作量**——Focus trap、键盘导航、ARIA 属性不用自己造
4. **Tailwind 对设计系统同学友好**——`bg-primary` 比 `theme.palette.primary.main` 直观得多

如果你也在 RSC 项目里用 CSS-in-JS，我的建议是：先拿一个纯展示页面做 Tailwind 试点，用数据说话，比写 ADR 更有说服力。

---

## 关联阅读

- [企业级电商组件库建设实践](/posts/design-system-cdd-practice/) — Token、CDD、视觉回归的完整实践
- [工程实践札记索引](/posts/engineering-practice-hub/)
- [企业级电商前端平台架构重构](/posts/ecommerce-architecture-redesign/) — RSC 渲染策略背景
