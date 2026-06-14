# Next.js 中间件链式架构设计指南

## 🎯 业务背景与挑战

在复杂的电商应用中，我们需要处理多样化的路由和页面重写需求：

- 🌍 **多国家支持**：不同国家有不同的产品目录和页面布局
- 📱 **多设备适配**：桌面端、移动端需要不同的页面主题
- 🛒 **动态路由重写**：产品页面、分类页面需要根据业务规则重写 URL
- 🏠 **首页个性化**：根据用户地区和设备显示不同的首页内容
- 📊 **A/B 测试**：需要根据实验配置调整页面行为
- 📝 **请求追踪**：记录和分析用户的访问行为

**传统方案的问题：**

```typescript
// ❌ 所有逻辑混在一个中间件里，难以维护
export function middleware(request: NextRequest) {
  // 参数解析逻辑
  const deviceType = getUserAgent(request);
  const region = extractRegion(request);

  // 业务重写逻辑
  if (isProductPage(request)) {
    // 产品页面处理
  }

  if (isCategoryPage(request)) {
    // 分类页面处理
  }

  // A/B测试逻辑
  // 日志记录逻辑
  // ... 100+ 行混合代码
}
```

## 🚀 链式中间件架构

### 核心设计理念

我们设计了一个**链式中间件架构**，将复杂的业务逻辑拆分为独立的、可组合的中间件模块：

```typescript
// ✅ 清晰的模块化设计
export default chain([
  withParamResolver, // 🔍 第一步：解析参数，设置基础数据
  withLogger, // 📝 第二步：日志记录
  withAbTest, // 🧪 第三步：A/B测试配置
  withCountrySelect, // 🌍 第四步：国家路径选择
  withHome, // 🏠 第五步：首页内容重写
  withPla, // 📋 第六步：产品列表实验
  withPlp, // 📦 第七步：产品列表页处理
  withClp, // 🏷️ 第八步：分类着陆页处理
  withRewrite, // 🛒 最后：兜底URL规范化
]);
```

### 执行流程

```
Request → ParamResolver → Logger → AbTest → CountrySelect → Home → PLA → PLP → CLP → Rewrite → Response
            ↓               ↓        ↓          ↓          ↓     ↓     ↓     ↓      ↓
        设置headers     记录日志   实验配置   国家处理   首页重写  实验  产品  分类  兜底重写
```

**关键特性：**

- 🎯 **线性执行**：从左到右顺序执行，简单直观
- 🛑 **早期中断**：任何中间件可以直接返回响应，中断后续执行
- 📋 **Headers 传递**：通过 request.headers 传递数据，符合 Web 标准
- 🔄 **状态累积**：response 对象自动累积所有中间件的修改

## 💻 技术实现

### 核心类型定义

```typescript
// 简洁的中间件类型
export type CustomMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
  response: NextResponse
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

// 中间件工厂模式
export type MiddlewareFactory = (middleware: CustomMiddleware) => CustomMiddleware;

// 链式组合器
export function chain(functions: MiddlewareFactory[], index = 0): CustomMiddleware;
```

### 链式组合器实现

```typescript
export function chain(functions: MiddlewareFactory[], index = 0): CustomMiddleware {
  const current = functions[index];

  if (current) {
    const next = chain(functions, index + 1);
    return current(next);
  }

  // 基础情况：返回最终响应
  return (request, event, response) => response;
}
```

### 数据传递机制

#### 通过 Headers 传递数据

```typescript
// 设置数据
request.headers.set('x-device-type', 'mobile');
request.headers.set('x-region', 'sg');
request.headers.set('x-lng', 'en');
request.headers.set('x-original-pathname', '/products');

// 读取数据
const deviceType = request.headers.get('x-device-type');
const region = request.headers.get('x-region');
```

#### 类型安全的参数获取

```typescript
interface RequiredMiddlewareParams {
  deviceType: DeviceType;
  theme: Theme;
  deviceTheme: DeviceTheme;
  region: Region;
  locale: Locale;
  originalPathname: string;
}

// 统一的参数获取函数
export function getRequiredParams(request: NextRequest): RequiredMiddlewareParams;
export function getOptionalParams(request: NextRequest): OptionalMiddlewareParams;
export function getMiddlewareParams(request: NextRequest): MiddlewareParams;
```

### 响应处理机制

#### 继续执行链路

```typescript
// ✅ 继续执行下一个中间件
return middleware(request, event, response);
```

#### 中断执行链路

```typescript
// 🛑 立即中断，返回重写响应
const headers = new Headers(response.headers); // 保持之前的修改
return NextResponse.rewrite(targetUrl, { headers });

// 🛑 立即中断，返回重定向响应
return NextResponse.redirect(targetUrl);
```

## 📝 中间件开发指南

### 标准中间件结构

```typescript
export function withExample(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // === 1. 获取参数 ===
    const { originalPathname, region } = getRequiredParams(request);

    // === 2. 业务逻辑判断 ===
    if (!shouldProcess(originalPathname)) {
      return middleware(request, event, response); // 跳过处理
    }

    // === 3. 执行业务逻辑 ===
    const targetPath = await processBusinessLogic(originalPathname, region);

    // === 4. 决策分支 ===
    if (targetPath) {
      // 🛑 需要重写，中断链路
      const targetUrl = buildInternalUrl(request, targetPath);
      const headers = new Headers(response.headers);
      return NextResponse.rewrite(targetUrl, { headers });
    }

    // ✅ 继续执行链路
    return middleware(request, event, response);
  };
}
```

### 性能优化：跳过机制

对于某些中间件，我们可以提前判断是否需要执行：

```typescript
// 跳过判断工具
export function shouldSkipPlpClp(request: NextRequest): boolean {
  const originalPathname = request.headers.get('x-original-pathname');
  return shouldSkipForPatterns(originalPathname, SKIP_FOR_PLP_CLP);
}

// 在中间件中使用
export function withPlp(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // ⚡ 早期跳过，提升性能
    if (shouldSkipPlpClp(request)) {
      return middleware(request, event, response);
    }

    // 执行PLP业务逻辑
    // ...
  };
}
```

### Cookie 管理

```typescript
// 标准化的Cookie操作
export function createCookieManager(request: NextRequest, response?: NextResponse) {
  return {
    get: (key: string) => getCookieValue(request, key),
    set: (key: string, value: string, options?: CookieOptions) => {
      // 统一的Cookie设置逻辑
    },
  };
}

// 在中间件中使用
export function withExample(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const cookieManager = createCookieManager(request, response);

    const userPreference = cookieManager.get('userPreference');
    if (!userPreference) {
      cookieManager.set('userPreference', 'default');
    }

    return middleware(request, event, response);
  };
}
```

## 🛠️ 实际业务案例

### 案例 1：产品列表页处理 (PLP)

```typescript
export function withPlp(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // 性能优化：早期跳过
    if (shouldSkipPlpClp(request)) {
      return middleware(request, event, response);
    }

    const { originalPathname } = getRequiredParams(request);

    // 检查是否为产品列表页
    const plpMatch = originalPathname.match(/^\/([^\/]+)$/);
    if (!plpMatch) {
      return middleware(request, event, response);
    }

    const categorySlug = plpMatch[1];

    // 验证分类存在性
    const categoryExists = await checkCategoryExists(categorySlug);
    if (!categoryExists) {
      return middleware(request, event, response);
    }

    // 构建重写目标
    const targetPath = `/category/plp/${categorySlug}`;
    const targetUrl = buildInternalUrl(request, targetPath);

    // 设置额外信息
    request.headers.set('x-category-slug', categorySlug);

    // 执行重写
    const headers = new Headers(response.headers);
    return NextResponse.rewrite(targetUrl, { headers });
  };
}
```

### 案例 2：首页个性化

```typescript
export function withHome(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const { originalPathname, region } = getRequiredParams(request);

    // 只处理首页请求
    if (originalPathname !== '/') {
      return middleware(request, event, response);
    }

    // 根据地区选择首页模板
    const homeTemplate = getHomeTemplateByRegion(region);
    const targetPath = `/home/${homeTemplate}`;
    const targetUrl = buildInternalUrl(request, targetPath);

    // 设置首页信息
    request.headers.set('x-home-template', homeTemplate);
    request.headers.set('x-is-homepage', 'true');

    const headers = new Headers(response.headers);
    return NextResponse.rewrite(targetUrl, { headers });
  };
}
```

### 案例 3：A/B 测试

```typescript
export function withAbTest(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const cookieManager = createCookieManager(request, response);

    // 获取或分配实验组
    let experimentId = cookieManager.get('experiment_id');
    if (!experimentId) {
      experimentId = Math.random() > 0.5 ? 'variant_a' : 'variant_b';
      cookieManager.set('experiment_id', experimentId, {
        maxAge: 30 * 24 * 60 * 60, // 30天
      });
    }

    // 设置实验信息
    request.headers.set('x-experiment-id', experimentId);

    return middleware(request, event, response);
  };
}
```

## 📊 架构优势

### 1. 🎯 职责分离

每个中间件专注单一职责：

- `withParamResolver`: 专注参数解析
- `withLogger`: 专注日志记录
- `withPlp`: 专注产品列表页处理
- `withHome`: 专注首页处理

### 2. ⚡ 性能优化

- **早期中断**: 任何中间件可立即返回，避免后续不必要的执行
- **条件跳过**: 通过 `shouldSkip` 机制提前跳过不相关的处理
- **Headers 传递**: 使用原生 API，无额外性能开销

### 3. 🛠️ 易于维护

- **模块化**: 每个中间件可独立开发、测试、部署
- **类型安全**: 完整的 TypeScript 类型支持
- **标准 API**: 使用 Next.js 原生 API，学习成本低

### 4. 🔄 扩展性强

添加新功能只需：

1. 创建新的中间件工厂函数
2. 添加到 `chain()` 数组中
3. 配置执行顺序

## 🚀 使用指南

### 快速开始

```typescript
// 1. 在 middleware.ts 中配置中间件链
import { chain } from './middleware/lib/chain';
import { withParamResolver, withLogger, withPlp, withRewrite } from './middleware/middlewares';

export default chain([withParamResolver, withLogger, withPlp, withRewrite]);

// 2. 配置路由匹配
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 添加自定义中间件

```typescript
// 1. 创建中间件文件
// middleware/middlewares/withCustomFeature.ts

export function withCustomFeature(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    // 你的业务逻辑
    const { originalPathname } = getRequiredParams(request);

    if (shouldProcessCustomFeature(originalPathname)) {
      // 处理逻辑
      const targetUrl = buildCustomUrl(request);
      const headers = new Headers(response.headers);
      return NextResponse.rewrite(targetUrl, { headers });
    }

    return middleware(request, event, response);
  };
}

// 2. 添加到链中
export default chain([
  withParamResolver,
  withLogger,
  withCustomFeature, // 🆕 添加新中间件
  withPlp,
  withRewrite,
]);
```

## 🎉 总结

这个链式中间件架构为 Next.js 应用提供了：

- 🎯 **清晰的职责分离**: 每个中间件专注单一功能
- ⚡ **高性能执行**: 早期中断和条件跳过机制
- 📋 **标准化数据传递**: 通过 request.headers 传递数据
- 🛠️ **易于维护**: 模块化设计，独立开发和测试
- 🔄 **强扩展性**: 新功能只需添加新中间件
- 📝 **完整类型支持**: TypeScript 全程类型安全
- 🚀 **原生兼容**: 完全符合 Next.js 官方 API 设计

通过将复杂的业务逻辑拆分为简单的、可组合的中间件模块，我们实现了既强大又易维护的路由处理系统。
