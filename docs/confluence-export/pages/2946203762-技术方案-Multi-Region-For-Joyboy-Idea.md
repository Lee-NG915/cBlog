---
confluence_id: "2946203762"
title: "技术方案 - Multi-Region For Joyboy (Idea)"
status: current
parent_id: "2583822375"
depth: 1
domain: architecture
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2946203762
local_joyboy_doc: null
blog_post: null
---
# Multi-Region For Joyboy

## 一、项目结构

```
src/
├── app/                           # App Router
│   ├── [locale]/                 # 动态路由 - 基于语言
│   │   ├── layout.tsx           # 区域相关布局
│   │   └── page.tsx             # 区域首页
│   └── layout.tsx                # 根布局
├── types/                        # 类型定义
│   ├── region.ts                # 区域配置类型
│   └── feature-flags.ts         # 功能开关类型
├── configs/                      # 配置文件
│   ├── regions/                 # 区域配置
│   │   ├── index.ts            # 配置导出
│   │   ├── constants.ts        # 常量定义
│   │   ├── us.ts              # 美国配置
│   │   └── au.ts              # 澳洲配置
│   └── feature-flags/          # 功能开关
│       ├── index.ts           # 开关定义
│       └── constants.ts       # 开关常量
├── hooks/                       # React Hooks
│   ├── useRegion.ts           # 区域 Hook
│   └── useFeatureFlag.ts      # 功能开关 Hook
└── utils/                      # 工具函数
    ├── region.ts              # 区域工具
    └── feature-flags.ts       # 功能开关工具
```

## 二、核心类型定义

### 1. 区域配置类型 (types/region.ts)

```
export interface RegionConfig {
  // 基础信息
  code: string;
  name: string;
  language: string;
  
  // 格式化配置
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
  
  formats: {
    date: string;
    time: string;
    timezone: string;
  };
  
  // 业务配置
  payment: {
    methods: string[];
    vatRate: number;
  };
  
  business: {
    customerService: {
      email: string;
      phone: string;
      hours: string;
    };
    socialMedia: Record<string, string>;
  };
}
```

### 2. 功能开关类型 (types/feature-flags.ts)

```
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  
  isEnabled: boolean;
  enabledRegions?: string[];
  
  rules?: {
    percentage?: number;
    whitelist?: string[];
    userTypes?: string[];
    startDate?: string;
    endDate?: string;
    conditions?: Record<string, any>;
  };
  
  dependencies?: string[];
  
  metrics?: {
    trackingId?: string;
    logSampling?: number;
  };
}
```

## 三、配置实现

### 1. 区域配置 (configs/regions/us.ts)

```
import { RegionConfig } from '@/types/region';

export const usConfig: RegionConfig = {
  code: 'us',
  name: 'United States',
  language: 'en-US',
  
  currency: {
    code: 'USD',
    symbol: '$',
    position: 'before'
  },
  
  formats: {
    date: 'MM/DD/YYYY',
    time: '12',
    timezone: 'America/New_York'
  },
  
  payment: {
    methods: ['stripe', 'paypal'],
    vatRate: 0
  },
  
  business: {
    customerService: {
      email: 'support@us.example.com',
      phone: '+1 (800) 123-4567',
      hours: '9:00 AM - 5:00 PM EST'
    },
    socialMedia: {
      facebook: 'company.us',
      twitter: 'company_us'
    }
  }
};
```

### 2. 功能开关配置 (configs/feature-flags/index.ts)

```
import { FeatureFlag } from '@/types/feature-flags';
import { FEATURES } from './constants';

const featureFlags: Record<string, FeatureFlag> = {
  [FEATURES.NEW_CHECKOUT]: {
    id: FEATURES.NEW_CHECKOUT,
    name: 'New Checkout Experience',
    description: 'New streamlined checkout process',
    isEnabled: true,
    enabledRegions: ['us', 'uk'],
    rules: {
      percentage: 50,
      userTypes: ['premium']
    }
  },
  // ... 其他功能开关
};

export default featureFlags;
```

## 四、Hook 实现

### 1. useRegion Hook

```
// hooks/useRegion.ts
import { useCallback } from 'react';
import { getRegionConfig } from '@/configs/regions';
import { formatDate, formatPrice } from '@/utils/format';

export function useRegion() {
  const regionCode = process.env.NEXT_PUBLIC_REGION || 'us';
  const config = getRegionConfig(regionCode);
  
  const format = {
    date: useCallback((date: Date) => formatDate(date, config), [config]),
    price: useCallback((amount: number) => formatPrice(amount, config), [config])
  };
  
  return { config, format };
}
```

### 2. useFeatureFlag Hook

```
// hooks/useFeatureFlag.ts
import { useCallback } from 'react';
import { useRegion } from './useRegion';
import featureFlags from '@/configs/feature-flags';
import { evaluateFlag } from '@/utils/feature-flags';

export function useFeatureFlag(flagKey: string) {
  const { config: regionConfig } = useRegion();
  
  const isEnabled = useCallback((context = {}) => {
    const flag = featureFlags[flagKey];
    if (!flag) return false;
    
    return evaluateFlag(flag, {
      region: regionConfig.code,
      ...context
    });
  }, [flagKey, regionConfig.code]);
  
  return { isEnabled };
}
```

## 五、使用示例

### 1. 区域特定组件

```
// components/PriceDisplay.tsx
import { useRegion } from '@/hooks/useRegion';

export function PriceDisplay({ amount }: { amount: number }) {
  const { format } = useRegion();
  return <div>{format.price(amount)}</div>;
}
```

### 2. 功能开关控制

```
// components/NewCheckout.tsx
import { FEATURES } from '@/configs/feature-flags/constants';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export function NewCheckout() {
  const { isEnabled } = useFeatureFlag(FEATURES.NEW_CHECKOUT);
  
  if (!isEnabled()) {
    return null;
  }
  
  return <div>New Checkout Experience</div>;
}
```

## 六、环境变量配置

### 1. 开发环境 (.env.development)

```
NEXT_PUBLIC_REGION=us
NEXT_PUBLIC_API_ENDPOINT=<http://localhost:3000/api>
```

### 2. 生产环境 (.env.production)

```
NEXT_PUBLIC_REGION=us
NEXT_PUBLIC_API_ENDPOINT=<https://api.us.example.com>
```

## 七、开发规范

### 1. 区域配置规范

- 所有区域特定的配置必须定义在 `configs/regions` 目录下
- 必须提供完整的类型定义
- 使用常量定义区域代码
- 提供默认值和降级策略
### 2. 功能开关规范

- 功能开关 ID 必须在 constants 中定义
- 提供清晰的描述和文档
- 设置合理的规则和限制
- 及时清理无用的功能开关
- 定期检查依赖关系
### 3. 命名规范

```
// 区域代码
export const REGIONS = {
  US: 'us',
  AU: 'au'
} as const;

// 功能开关
export const FEATURES = {
  NEW_CHECKOUT: 'new-checkout',
  BETA_SEARCH: 'beta-search'
} as const;
```

## 八、注意事项

1. - **区域配置**

- 保持配置结构统一
- 提供合理的默认值
- 考虑配置的可扩展性
- 注意环境变量的使用
2. - **功能开关**

- 避免过于复杂的规则
- 及时清理过期特性
- 监控功能使用情况
- 保持文档更新
3. - **性能优化**

- 避免不必要的重渲染
- 合理使用缓存
- 优化配置加载
4. - **类型安全**

- 确保完整的类型定义
- 使用类型常量
- 避免使用 any
## 九、最佳实践

1. - **配置管理**

- 使用版本控制
- 提供配置迁移方案
- 定期审查配置
- 保持向后兼容
2. - **功能开关**

- 渐进式发布新功能
- 提供紧急关闭机制
- 监控功能使用情况
- 定期清理无用开关
3. - **代码组织**

- 按职责分离代码
- 保持目录结构清晰
- 遵循命名约定
- 编写完整文档
4. - **测试策略**

- 编写单元测试
- 测试不同区域配置
- 测试功能开关逻辑
- 进行集成测试
## 十、扩展建议

1. - **动态配置服务**
```
class ConfigService {
  async getConfig(region: string): Promise<RegionConfig> {
    // 实现动态配置获取
  }
}
```

1. - **功能开关服务**
```
class FeatureFlagService {
  async getFlag(key: string): Promise<boolean> {
    // 实现动态功能开关
  }
}
```

1. - **监控和分析**
```
class Analytics {
  trackFeatureUsage(flagId: string, enabled: boolean) {
    // 实现使用追踪
  }
}
```

## 十一、开发流程

1. - **新增区域**

- 创建区域配置文件
- 添加必要的类型定义
- 更新常量定义
- 测试新区域配置
2. - **添加功能开关**

- 定义功能开关配置
- 设置开关规则
- 实现功能逻辑
- 测试功能开关
3. - **发布流程**

- 验证配置完整性
- 测试功能开关
- 灰度发布
- 监控反馈
## 十二、问题排查

1. - **配置问题**

- 检查环境变量
- 验证配置完整性
- 检查类型定义
- 查看控制台错误
2. - **功能开关问题**

- 检查开关状态
- 验证规则配置
- 检查依赖关系
- 查看使用日志
## 结语



## Ref

- [https://github.com/Unleash/unleash](https://github.com/Unleash/unleash)
-