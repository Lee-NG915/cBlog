---
confluence_id: "3299115101"
title: "市场业务功能特性Business Features"
status: current
parent_id: "3042443302"
depth: 2
domain: architecture
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3299115101
local_joyboy_doc: null
blog_post: null
---
## **领域层市场功能特性的设计技术方案**

### **1 设计目标**

1. - **市场差异化管理**：支持不同市场（SG、US、AU、CA）下的业务规则，如税率、支付方式、物流选项等。
2. - **接入基础设施层动态功能开关（Feature Flag）**：通过 Feature Flag 控制不同市场或业务场景下的功能启用情况。
3. - **解耦领域层与基础设施**：确保领域层不会直接依赖 `monorepo-features`，而是通过 `DomainFeatureService` 访问。
4. - **提升可维护性和扩展性**：使用工厂模式管理市场规则，避免 `switch-case` 冗余，提高可读性。
---

### **2 方案架构**

```
领域层 (Domain Layer)
 ├── MarketStrategy (市场策略接口)
 ├── USMarket, EUMarket, SGMarket, CAMarket (具体市场实现)
 ├── DomainFeatureService (统一 Feature API 访问)
 └── MarketFactory (市场策略工厂)
 
基础设施层 (Infrastructure Layer)
 ├── monorepo-features (Feature Flag 管理)
 └── featureManager (功能开关管理)
```

---

### **3 技术实现**

#### **3.1 市场策略接口**

市场策略接口定义不同市场的业务规则：

```
interface MarketStrategy {
  getDefaultZipcode: () => { state: string; city: string; zip: string };
  getZipcodeRule: () => RegExp;
}
```

#### **3.2 市场差异化实现**

不同市场实现自己的业务规则：

```
class USMarket implements MarketStrategy {
  getDefaultZipcode(): { state: string; city: string; zip: string } {
    return { state: 'CA', city: 'Los Angeles', zip: '90024' };
  }
  getZipcodeRule(): RegExp {
    return /^([0-9]{4})$/;
  }
}

class CAMarket implements MarketStrategy {
  getDefaultZipcode(): { state: string; city: string; zip: string } {
    return { state: 'ON', city: 'Toronto', zip: 'M5H 2N1' };
  }
  getZipcodeRule(): RegExp {
    return /^([0-9]{4})$/;
  }
}
```

#### **3.3 市场策略工厂**

使用对象映射替代 `switch-case`，提高可扩展性：

```
const MARKET_MAP: Record<string, new () => MarketStrategy> = {
  SG: SGMarket,
  US: USMarket,
  AU: AUMarket,
  CA: CAMarket,
};

class MarketFactory {
  static getMarket(market: string): MarketStrategy {
    const MarketClass = MARKET_MAP[market];
    if (!MarketClass) throw new Error('Invalid market');
    return new MarketClass();
  }
}
```

#### **3.4 领域内统一 Feature flag 访问：DomainFeatureService**

为了避免领域层直接依赖 `monorepo-features featureManager`，引入 `DomainFeatureService` 作为适配器：

```
class DomainFeatureService {
  static isFeatureEnabled(feature: string): boolean {
    return featureManager.isFeatureEnabled(feature);
  }
}
```

#### **3.5 领域内访问所有类型feature的统一入口**

```
export const orderFeatureService = {
  ...MarketFactory.getMarket(EcEnv.NEXT_PUBLIC_COUNTRY),
  enabledStripe: () => DomainFeatureService.isFeatureEnabled(featureManager.featureName.STRIPE),
};
```

**3.6 如何使用**

业务内部不需要区分市场

```
function Component（）{
  const defaultZipcode = orderFeatureService.getDefaultZipcode()
  return <div></div>
}
```

---

### **4 方案优势**

 **领域模型清晰**：市场策略（MarketStrategy）作为领域模型，业务规则明确。
 **解耦 Feature Flag 访问**：`DomainFeatureService` 适配基础设施层，避免直接依赖 `featureManager`。
 **工厂模式管理市场策略**：`MarketFactory` 通过对象映射动态获取市场策略，避免 `switch-case` 冗余，提高可维护性。
 **支持未来扩展**：新增市场规则时，只需实现新的 `MarketStrategy`，无需修改现有逻辑。