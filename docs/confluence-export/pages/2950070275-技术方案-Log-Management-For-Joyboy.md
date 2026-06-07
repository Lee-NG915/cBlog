---
confluence_id: "2950070275"
title: "技术方案 - Log Management For Joyboy"
status: current
parent_id: "2583822375"
depth: 1
domain: observability
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2950070275
local_joyboy_doc: "docs/joyboy/docs/observability/error-handling-flow.md"
blog_post: null
---
```
flowchart TD
    subgraph "Application Layer"
        RSC["React Server Components"]
        CC["Client Components"]
        SA["Server Actions"]
    end

    subgraph "Logging Layer"
        Logger["@/lib/logger
        - server.ts
        - client.ts"]
        
        ClientLogger["Client Logger
        - window events
        - user actions
        - client errors"]
        
        ServerLogger["Server Logger
        - API calls
        - DB operations
        - server errors"]
    end

    subgraph "Infrastructure"
        DD["Datadog"]
    end

    RSC --> ServerLogger
    CC --> ClientLogger
    SA --> ServerLogger
    
    ClientLogger --> DD
    ServerLogger --> DD

    style ClientLogger fill:#f9f,stroke:#333
    style ServerLogger fill:#bbf,stroke:#333
    style DD fill:#bfb,stroke:#333
```



```
// lib/logger/index.ts
import type { LogLevel, LogPayload } from './types';

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private static instance: Logger;
  private initialized = false;

  private constructor() {}

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    // 动态导入 Datadog
    const { datadogLogs } = await import('@datadog/browser-logs');
    
    datadogLogs.init({
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
      site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
      service: 'your-service-name',
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    });

    this.initialized = true;
  }

  async log({ message, level, meta = {} }: LogPayload) {
    // 确定运行环境
    const isServer = typeof window === 'undefined';
    const runtime = isServer ? 'server' : 'client';
    
    // 开发环境下在控制台显示日志
    if (isDevelopment) {
      console.log(`[${runtime}][${level}] ${message}`, meta);
    }

    try {
      // 如果是服务端且是生产环境,使用 server-only 的日志方法
      if (isServer && process.env.NODE_ENV === 'production') {
        const { serverLog } = await import('./server');
        await serverLog({ message, level, meta: { ...meta, runtime } });
        return;
      }

      // 客户端或开发环境使用 browser-logs
      await this.initialize();
      const { datadogLogs } = await import('@datadog/browser-logs');
      datadogLogs.logger.log(message, {
        level,
        ...meta,
        runtime,
      });
    } catch (error) {
      // 确保日志错误不会影响应用运行
      console.error('Logging failed:', error);
    }
  }
}

// 导出便捷的日志方法
export const log = async (payload: LogPayload) => {
  return Logger.getInstance().log(payload);
};

export const info = async (message: string, meta?: Record<string, any>) => {
  return log({ message, level: 'info', meta });
};

export const error = async (message: string, meta?: Record<string, any>) => {
  return log({ message, level: 'error', meta });
};

export const warn = async (message: string, meta?: Record<string, any>) => {
  return log({ message, level: 'warn', meta });
};

export const debug = async (message: string, meta?: Record<string, any>) => {
  return log({ message, level: 'debug', meta });
};
```

然后在组件中使用:

```
// components/AddToCart.tsx
'use client';

import { info, error } from '@/lib/logger';

export function AddToCart({ productId }: { productId: string }) {
  const handleClick = async () => {
    try {
      await info('Add to cart clicked', {
        productId,
        component: 'AddToCart'
      });
      // 处理添加到购物车逻辑
    } catch (err) {
      await error('Add to cart failed', {
        productId,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

在 Server Components 中使用:

```
// app/products/page.tsx
import { info, error } from '@/lib/logger';

export default async function ProductsPage() {
  try {
    const products = await db.products.findMany();
    
    await info('Products fetched successfully', {
      count: products.length,
      page: 'products'
    });

    return <ProductList products={products} />;
  } catch (err) {
    await error('Failed to fetch products', {
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    throw err;
  }
}
```

这个改进后的设计有以下优势:

1. - **统一的 API**:

- 无需关心组件运行环境
- 相同的调用方式处理所有场景
2. - **智能的运行时判断**:

- 自动检测运行环境
- 根据环境选择合适的日志处理方式
3. - **性能优化**:

- 使用动态导入减少初始包大小
- 延迟初始化日志服务
- 避免在服务端不必要的代码加载
4. - **更好的开发体验**:

- 开发环境下提供控制台日志
- 清晰的运行时环境标识
- 简洁的 API 设计
5. - **错误处理**:

- 优雅处理日志失败的情况
- 不影响应用主流程
- 提供详细的错误信息
6. - **类型安全**:

- 完整的 TypeScript 类型支持
- 编译时错误检查
使用建议:

1. - 在 `.env` 文件中配置相关环境变量:
```
# .env.local
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=xxx
NEXT_PUBLIC_DATADOG_SITE=datadoghq.com
NEXT_PUBLIC_LOG_LEVEL=info  # 生产环境可以设置为 warn 或 error
```

1. - 在日志中包含有用的上下文信息:
```
await info('User action', {
  userId: session?.user?.id,
  action: 'checkout',
  pageUrl: window.location.href,
  timestamp: Date.now()
});
```

1. - 使用 try-catch 包装重要操作:
```
try {
  // 重要操作
  await processOrder(orderData);
  await info('Order processed', { orderId });
} catch (err) {
  await error('Order processing failed', {
    orderId,
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined
  });
  // 错误处理逻辑
}
```

这个方案解决了 'use client' 组件在服务端和客户端都会运行的问题,同时保持了代码的简洁性和可维护性。你觉得这个改进的方案如何？

## Ref

-