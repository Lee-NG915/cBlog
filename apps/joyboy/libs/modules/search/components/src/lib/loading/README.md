# SearchLoadingSkeleton 组件

## 概述

`SearchLoadingSkeleton` 是一个高度可配置的骨架屏组件，用于在搜索数据加载时提供优雅的 Loading 状态。该组件完全匹配真实页面的布局和样式，为用户提供流畅的加载体验。

## ⚠️ 重要说明 - 官方文档澄清

### ✅ 正确理解：Suspense 完全支持 async Server Component

根据 **Next.js 官方文档**：

> "**在服务器组件中使用 `Suspense` 是完全支持的**，这允许在异步操作（如数据获取）进行时显示回退 UI（例如加载指示器），从而提升用户体验。"

**官方示例：**

```jsx
import { Suspense } from 'react';
import { PostFeed, Weather } from './Components';

export default function Posts() {
  return (
    <section>
      <Suspense fallback={<p>Loading feed...</p>}>
        <PostFeed /> {/* 可以是 async Server Component */}
      </Suspense>
      <Suspense fallback={<p>Loading weather...</p>}>
        <Weather /> {/* 可以是 async Server Component */}
      </Suspense>
    </section>
  );
}
```

**官方文档引用：**

- [Next.js - 加载 UI 和流式处理](https://nextjs.net.cn/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js - 服务器组件](https://nextjscn.org/docs/app/building-your-application/rendering/server-components)

### 📊 推荐的架构模式

我们提供了两种使用方式，**推荐使用方式 1（细粒度 Loading）**：

#### 方式 1：使用 SearchViewSuspenseWrapper（推荐 ⭐）

**优势：细粒度 Loading 控制，实现流式渲染**

```tsx
import { SearchViewSuspenseWrapper } from '@castlery/modules-search-components';

export function ProductListingPage({ salePageData }) {
  return (
    <Container>
      {/* ✅ 这些内容立即显示，不等待数据 */}
      <Breadcrumbs />
      <Banner />

      {/* ⏳ 只有搜索结果区域显示 loading，其他部分立即可见 */}
      <SearchViewSuspenseWrapper queryString={queryString} categoryPermalink={currentPagePermalink} />

      {/* ✅ 这些内容立即显示，不等待数据 */}
      <SeoFaqs />
    </Container>
  );
}
```

**效果：**

- ✅ 面包屑、Banner、SEO 等内容立即显示
- ⏳ 只有搜索结果区域显示骨架屏
- 🚀 更好的用户体验（部分内容立即可见）

#### 方式 2：使用路由层级的 loading.tsx

**适用场景：整页 Loading**

```tsx
// app/(PLP)/loading.tsx
import { SearchLoadingSkeleton } from '@castlery/modules-search-components';

export default function PLPLoading() {
  return <SearchLoadingSkeleton />;
}
```

```tsx
// 页面组件使用 async
export async function ProductListingPage() {
  return (
    <Container>
      <Breadcrumbs />
      <Banner />
      <SearchViewServerWrapper /> {/* async - 整个页面等待 */}
      <SeoFaqs />
    </Container>
  );
}
```

**效果：**

- ⏳ 整个页面显示 loading
- 📄 适合首次加载或整页刷新

### 🎯 最佳实践：双重保障

**推荐同时使用两种方式：**

```tsx
// 1. 路由层级的 loading.tsx（整页后备）
// app/(PLP)/loading.tsx
export default function PLPLoading() {
  return <SearchLoadingSkeleton />;
}

// 2. 组件内使用 SearchViewSuspenseWrapper（细粒度 loading）
// libs/modules/search/components/src/lib/templates/product-listing-page.tsx
export function ProductListingPage({ salePageData }) {
  return (
    <Container>
      <Breadcrumbs /> {/* 立即显示 */}
      <Banner /> {/* 立即显示 */}
      {/* 只在这里显示 loading */}
      <SearchViewSuspenseWrapper {...props} />
      <SeoFaqs /> {/* 立即显示 */}
    </Container>
  );
}
```

**为什么双重保障？**

- 路由 loading.tsx：处理首次访问、整页刷新
- SearchViewSuspenseWrapper：处理组件内数据加载（更细粒度）

## 特性

- ✅ **完全匹配真实布局** - 与实际页面布局保持一致
- ✅ **高度可配置** - 支持自定义横幅、面包屑、网格等
- ✅ **响应式设计** - 在移动端和桌面端都有优化的体验
- ✅ **性能优化** - 使用 MUI Skeleton 组件，轻量高效
- ✅ **类型安全** - 完整的 TypeScript 支持
- ✅ **流式渲染支持** - 配合 Suspense 实现部分内容立即显示

## 配置选项

### Props

```typescript
interface SearchLoadingSkeletonProps {
  /**
   * 是否显示面包屑骨架屏
   * @default true
   */
  showBreadcrumbs?: boolean;

  /**
   * 是否显示横幅骨架屏
   * @default true
   */
  showBanner?: boolean;

  /**
   * 是否显示筛选器骨架屏
   * @default true
   */
  showFilters?: boolean;

  /**
   * 产品卡片数量
   * @default 12
   */
  productCount?: number;

  /**
   * 横幅高度配置 (响应式)
   * @default { xs: 146, md: 252 }
   */
  bannerHeight?: {
    xs: number;
    md: number;
  };

  /**
   * 网格列数配置 (响应式)
   * @default { xs: 6, sm: 4, lg: 3 }
   */
  gridColumns?: {
    xs: number;
    sm: number;
    lg: number;
  };
}
```

### 使用示例

```tsx
// 完整骨架屏（用于 loading.tsx）
<SearchLoadingSkeleton />

// 只显示搜索结果区域（用于 SearchViewSuspenseWrapper 的 fallback）
<SearchLoadingSkeleton
  showBreadcrumbs={false}
  showBanner={false}
/>

// 自定义产品数量
<SearchLoadingSkeleton productCount={24} />

// 自定义横幅高度
<SearchLoadingSkeleton
  bannerHeight={{ xs: 200, md: 400 }}
/>

// 组合配置
<SearchLoadingSkeleton
  showBreadcrumbs={false}
  showBanner={false}
  productCount={16}
  gridColumns={{ xs: 12, sm: 6, lg: 4 }}
/>
```

## 完整示例

### Product Listing Page（推荐实现）

```tsx
// libs/modules/search/components/src/lib/templates/product-listing-page.tsx
import { SearchViewSuspenseWrapper } from '../search-view/search-view-suspense-wrapper';

export function ProductListingPage({ salePageData }: ProductListingPageProps) {
  return (
    <Container>
      {/* ✅ 立即显示的内容 */}
      <PLPBreadcrumbs currentPageName={currentPageName} />
      <Banner {...bannerProps} />

      {/* ⏳ 只有这部分显示 loading */}
      <SearchViewSuspenseWrapper queryString={queryString} categoryPermalink={currentPagePermalink} />

      {/* ✅ 立即显示的内容 */}
      <SeoFaqs {...seoProps} />
    </Container>
  );
}
```

```tsx
// app/(PLP)/loading.tsx - 作为整页后备
import { SearchLoadingSkeleton } from '@castlery/modules-search-components';

export default function PLPLoading() {
  return <SearchLoadingSkeleton />;
}
```

### Category Landing Page

```tsx
// libs/modules/search/components/src/lib/templates/category-landing-page.tsx
import { SearchViewSuspenseWrapper } from '../search-view/search-view-suspense-wrapper';

export function CategoryLandingPage({ categoryItem }: CategoryLandingPageProps) {
  return (
    <Container>
      <PLPBreadcrumbs items={breadcrumbs} />
      <Banner {...bannerProps} />

      {/* 细粒度 loading */}
      <SearchViewSuspenseWrapper categoryFacetFilter={categoryFacetFilter} categoryPermalink={searchPermalink} />

      <SeoFaqs {...seoProps} />
    </Container>
  );
}
```

### Search Results Page

```tsx
// libs/modules/search/components/src/lib/templates/search-results-page.tsx
import { SearchViewSuspenseWrapper } from '../search-view/search-view-suspense-wrapper';

export function SearchResultsPage() {
  return (
    <Container>
      <Breadcrumbs />
      <Banner />

      {/* 细粒度 loading */}
      <SearchViewSuspenseWrapper />

      <SeoFaqs />
    </Container>
  );
}
```

## 设计原则

1. **真实布局匹配** - 骨架屏完全复刻真实页面的布局结构：

   - 面包屑导航
   - 横幅区域
   - 筛选器侧边栏
   - 产品网格布局

2. **响应式优先** - 所有组件都针对不同屏幕尺寸进行了优化：

   - 移动端：单列布局，简化筛选器
   - 平板：双列布局
   - 桌面：多列布局，侧边筛选器

3. **性能考量** - 使用轻量级的 Skeleton 组件，避免复杂动画

4. **视觉一致性** - 与 Fortress 设计系统保持一致

5. **流式渲染** - 配合 Suspense 实现部分内容立即显示，提升用户体验

## 技术细节

### 组件结构

```tsx
SearchLoadingSkeleton
├── Container (外层容器)
│   ├── Breadcrumbs (可选)
│   ├── Banner (可选)
│   └── Content Container
│       ├── Filter Sidebar (桌面端可见)
│       └── Products Grid
│           └── ProductCardSkeleton × N
```

### ProductCardSkeleton

内部使用的产品卡片骨架组件，包含：

- 产品图片占位
- 标题占位
- 价格占位
- 按钮占位

### 依赖

- `@castlery/fortress` - UI 组件库
- `@mui/material` - Skeleton 组件

## 技术架构

- **组件位置**: `libs/modules/search/components/src/lib/loading/`
- **导出路径**: `@castlery/modules-search-components`
- **依赖**: `@castlery/fortress`
- **React 版本**: 兼容 React 18+ (支持 Suspense 和 Server Components)

## 最佳实践

1. **优先使用 SearchViewSuspenseWrapper** - 提供最佳的用户体验，实现流式渲染
2. **双重保障** - 同时使用组件级和路由级 loading
3. **模板组件保持同步** - 使用 SearchViewSuspenseWrapper 时，模板组件不需要 async
4. **按需配置骨架屏** - 根据实际显示内容配置 showBreadcrumbs 和 showBanner
5. **保持布局一致** - 确保骨架屏与真实页面视觉一致

## 常见问题

### Q: SearchViewSuspenseWrapper 和直接用 Suspense 有什么区别？

A: `SearchViewSuspenseWrapper` 是一个封装好的组件，提供：

- ✅ 内置正确的 Suspense 配置
- ✅ 预配置的 SearchLoadingSkeleton 作为 fallback
- ✅ 类型安全的 props 传递
- ✅ 开箱即用，无需手动配置

### Q: 能同时使用 SearchViewSuspenseWrapper 和 loading.tsx 吗？

A: **可以，而且强烈推荐！**

- **SearchViewSuspenseWrapper**：处理组件内数据加载（细粒度 loading）
- **loading.tsx**：处理整页加载（首次访问、整页刷新）

这样提供了双重保障和最佳用户体验。

### Q: 为什么推荐细粒度 Loading？

A: 根据 Next.js 官方文档，使用 Suspense 包裹异步 Server Component 可以实现：

1. **流式渲染** - 部分内容立即显示，不需要等待所有数据
2. **更好的用户体验** - 用户可以立即看到面包屑、Banner 等内容
3. **更快的感知性能** - 页面不会完全空白

### Q: 什么时候使用 loading.tsx vs SearchViewSuspenseWrapper？

A:

**使用 loading.tsx（整页 loading）：**

- ✅ 首次访问页面
- ✅ 整页刷新
- ✅ 页面切换
- ✅ 简单场景

**使用 SearchViewSuspenseWrapper（细粒度 loading）：**

- ✅ 想要部分内容立即显示
- ✅ 需要流式渲染
- ✅ 提升用户体验
- ✅ 复杂页面布局

**推荐：两者都用（双重保障）**

### Q: 模板组件应该是 async 还是同步？

A: 取决于你的选择：

**使用 SearchViewSuspenseWrapper：**

```tsx
// ✅ 同步组件
export function ProductListingPage() {
  return (
    <Container>
      <Breadcrumbs /> {/* 立即显示 */}
      <SearchViewSuspenseWrapper /> {/* 内部处理 async */}
      <SeoFaqs /> {/* 立即显示 */}
    </Container>
  );
}
```

**直接使用 SearchViewServerWrapper：**

```tsx
// ✅ async 组件
export async function ProductListingPage() {
  return (
    <Container>
      {/* 整个页面等待数据 */}
      <Breadcrumbs />
      <SearchViewServerWrapper /> {/* await */}
      <SeoFaqs />
    </Container>
  );
}
```

### Q: 什么时候应该隐藏面包屑和横幅？

A:

**在 SearchViewSuspenseWrapper 中（默认隐藏）：**

```tsx
// ✅ 默认 showBreadcrumbs={false}, showBanner={false}
<SearchViewSuspenseWrapper />
```

因为模板已经渲染了面包屑和横幅。

**在 loading.tsx 中（默认显示）：**

```tsx
// ✅ 显示完整骨架屏
<SearchLoadingSkeleton />
```

因为这是整页 loading，需要完整布局。

## 相关组件

- `SearchViewSuspenseWrapper` - 带 Suspense 的搜索视图包装器（推荐使用）
- `SearchViewServerWrapper` - 原始异步服务端搜索视图包装器
- `SearchView` - 客户端搜索视图组件
- `SearchLoading` - 客户端实时加载指示器（基于 InstantSearch 状态）
- `ProductCard` - 产品卡片组件

## 参考资料

- [Next.js - 加载 UI 和流式处理](https://nextjs.net.cn/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js - 服务器组件](https://nextjscn.org/docs/app/building-your-application/rendering/server-components)
- [React - Suspense](https://react.dev/reference/react/Suspense)

## 更新日志

### v2.0.0 (2025-10-21)

- ✅ **重大更新**：基于 Next.js 官方文档重新设计
- ✅ 新增 `SearchViewSuspenseWrapper` 组件（推荐使用）
- ✅ 支持细粒度 Loading（流式渲染）
- ✅ 支持双重保障模式（组件级 + 路由级）
- ✅ 更新文档，澄清 Suspense 的正确使用方式
- 📚 添加官方文档引用和最佳实践

### v1.0.0 (2025-10-21)

- ✅ 首次发布
- ✅ 完整的响应式支持
- ✅ 高度可配置的 props
- ✅ 优化的性能表现
- ✅ 完整的 TypeScript 类型支持
