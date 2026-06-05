# Warranty 系统升级技术设计文档

## Mulberry → Guardsman (Prosuro) 迁移方案

**版本**: v1.0  
**日期**: 2026-01-07  
**状态**: 待评审

---

## 📋 目录

1. [项目背景](#1-项目背景)
2. [现状分析](#2-现状分析)
3. [技术架构设计](#3-技术架构设计)
4. [数据模型设计](#4-数据模型设计)
5. [API 集成方案](#5-api-集成方案)
6. [版本控制与切换策略](#6-版本控制与切换策略)
7. [前端实现方案](#7-前端实现方案)
8. [后端实现方案](#8-后端实现方案)
9. [迁移策略](#9-迁移策略)
10. [测试策略](#10-测试策略)
11. [风险评估与应对](#11-风险评估与应对)
12. [项目时间线](#12-项目时间线)

---

## 1. 项目背景

### 1.1 业务背景

- **当前状态**: CA 和 US 市场使用 Mulberry 作为保险供应商
- **目标**: 切换到 Guardsman (通过 Prosuro 技术供应商)
- **市场范围**:
  - **CA**: Phase 1 上线时继续使用 Mulberry,后续(6 月)切换到 Guardsman
  - **US**: 直接上线 Guardsman
  - **其他市场**: 暂不涉及,后续扩展

### 1.2 技术背景

- **Mulberry**: SDK 集成,前端调用 API
- **Guardsman**: Prosuro 平台,使用 Headless API (前端) + Server-to-Service API (后端)
- **关键差异**:
  - Guardsman 引入 `planId` 概念(对应每个具体保险计划)
  - Guardsman 引入 `policyId`(支付后生成的正式保险单号)
  - Guardsman 使用 `providerSku`(用于创建保险单)
  - 需要增加 `warrantyVendor` 字段区分供应商

---

## 2. 现状分析

### 2.1 当前架构

#### 2.1.1 前端架构

```
PDP → MulberryManager (SDK 加载)
   → ProductMulberryPicker (选择保险)
   → addToCartCommandV2 (加车,携带 warrantyId)

Cart → WarrantyInlineButton (添加保险)
    → initMulberry (弹出 Mulberry Modal)
    → addWarranty/removeWarranty API

Checkout → 不支持添加保险
        → 使用 Cart 中的保险数据
```

#### 2.1.2 数据存储位置

```typescript
// Cart Line Item
interface WarrantyItemSchema {
  durationMonths: string; // 保险月份
  warrantyDiscount: string; // 保险折扣
  warrantyOfferCost: string; // 总价 = 单价 × 数量
  warrantyOfferId: string; // Mulberry offer ID
  warrantyOfferPrice: string; // 单价
  [property: string]: any;
}

// Order Line Item
interface OrderLineItemV1 {
  // ... 其他字段
  warrantyItem: WarrantyItemV1; // 保险信息
}

// Order 聚合字段
interface Order {
  warranty_total: string; // 总保险金额
  warranty_line_items: WarrantyLineItem[];
}
```

#### 2.1.3 现有流程

1. **PDP 加保险**:

   - 加载 Mulberry SDK
   - 调用 `window.mulberry.core.getWarrantyOffer()` 获取可选保险
   - 用户选择后,`warrantyId` 随商品一起加车

2. **Cart 加保险**:

   - 调用 Mulberry `create_offer` API
   - 用户在 Modal 选择保险
   - 调用 `/api/v1/cart/warranty` POST 接口

3. **Checkout**:

   - 不支持添加保险
   - 从 Cart 携带保险数据

4. **Order 创建**:
   - 订单支付后,调用 Mulberry `checkout` API 创建正式保险单
   - 同步保险信息至 NetSuite

### 2.2 现有问题

#### ⚠️ 缺少供应商标识

- 没有 `warrantyVendor` 字段,无法区分 Mulberry/Guardsman
- 新旧切换时,无法判断使用哪个供应商的 API

#### ⚠️ 数据结构不兼容

- Guardsman 需要 `planId`, `policyId`, `providerSku` 等新字段
- 当前结构无法存储这些信息

#### ⚠️ 缺少状态管理

- 没有 `warrantyStatus` 字段追踪保险状态(pending/active/canceled/failed)

#### ⚠️ 缺少部分取消支持

- 没有 `warrantyRefundPrice` 字段记录部分取消的金额

---

## 3. 技术架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Feature Flag Layer                       │
│  (控制 Mulberry/Guardsman 在不同市场的启用状态)                 │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Warranty Adapter Layer                      │
│                      (统一的保险服务抽象层)                      │
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │ MulberryAdapter  │              │ GuardsmanAdapter │        │
│  │  - SDK加载       │              │  - Widget加载    │        │
│  │  - API调用       │              │  - API调用       │        │
│  │  - 数据转换      │              │  - 数据转换      │        │
│  └──────────────────┘              └──────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Components                       │
│                                                                   │
│  PDP  →  Cart  →  Checkout  →  Order Details                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Services                         │
│                                                                   │
│  Cart Service  →  Order Service  →  NetSuite Sync               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 模块设计

#### 3.2.1 Feature Flag Service

```typescript
// packages/monorepo-features/src/lib/features/warranty.ts
interface WarrantyFeatureConfig {
  vendor: 'mulberry' | 'guardsman';
  enabledRegions: Region[];
  enabledAppChannels: ApplicationChannel[];
  config: {
    mulberry?: {
      publicToken: string;
      sdkUrl: string;
    };
    guardsman?: {
      publicKey: string;
    };
  };
}

// 根据 Region 返回当前启用的 Vendor
function getWarrantyVendor(region: Region): 'mulberry' | 'guardsman' | null;
```

#### 3.2.2 Warranty Adapter Interface

```typescript
// libs/shared/services/src/lib/warranty/warranty-adapter.interface.ts
interface WarrantyAdapter {
  // SDK/Widget 初始化
  initialize(config: WarrantyConfig): Promise<void>;

  // PDP: 获取商品可选的保险方案
  getProductWarranties(params: GetProductWarrantiesParams): Promise<WarrantyOffer[]>;

  // Cart: 获取购物车商品的保险验证
  validateCartWarranties(cartLineItems: CartLineItem[]): Promise<ValidationResult>;

  // Cart: 打开选择保险的 Modal
  openWarrantyModal(params: OpenModalParams): Promise<SelectedWarranty | null>;

  // Order: 创建正式保险单
  createWarrantyPolicy(params: CreatePolicyParams): Promise<PolicyResult>;

  // Order: 取消保险单
  cancelWarrantyPolicy(params: CancelPolicyParams): Promise<CancelResult>;

  // 数据转换: 转换为统一的前端数据格式
  toUnifiedWarrantyData(vendorData: any): UnifiedWarrantyData;
}
```

#### 3.2.3 Warranty Manager (统一入口)

```typescript
// libs/shared/services/src/lib/warranty/warranty-manager.ts
class WarrantyManager {
  private adapters: Map<string, WarrantyAdapter>;

  constructor() {
    this.adapters = new Map([
      ['mulberry', new MulberryAdapter()],
      ['guardsman', new GuardsmanAdapter()],
    ]);
  }

  // 根据 Region/Vendor 获取适配器
  private getAdapter(vendor?: string): WarrantyAdapter {
    const currentVendor = vendor || getWarrantyVendor(getCurrentRegion());
    return this.adapters.get(currentVendor);
  }

  // 代理所有方法到对应的 Adapter
  async getProductWarranties(...args) {
    return this.getAdapter().getProductWarranties(...args);
  }

  // ... 其他方法
}

export const warrantyManager = new WarrantyManager();
```

---

## 4. 数据模型设计

### 4.1 Cart 数据结构

#### 4.1.1 统一的 Warranty 数据结构

```typescript
// libs/shared/types/src/types/cart.entity.d.ts

/**
 * 统一的保险数据结构 (兼容 Mulberry 和 Guardsman)
 */
export interface WarrantyItemSchema {
  // ============ 通用字段 ============
  /**
   * 保险供应商: 'mulberry' | 'guardsman'
   * 【新增】用于区分供应商,决定使用哪个 API
   */
  warrantyVendor: 'mulberry' | 'guardsman';

  /**
   * 保险月份 (年限 * 12)
   */
  durationMonths: string;

  /**
   * 保险单价
   */
  warrantyOfferPrice: string;

  /**
   * 保险总价 = 单价 × line item 数量
   */
  warrantyOfferCost: string;

  /**
   * 保险折扣 (来自 Promotion/Coupon)
   */
  warrantyDiscount: string;

  /**
   * Offer ID
   * - Mulberry: warranty_offer_id
   * - Guardsman: offerId (代表商品有可用的保险服务)
   */
  warrantyOfferId: string;

  // ============ Guardsman 特有字段 ============
  /**
   * Plan ID (Guardsman 特有)
   * 具体保险计划的 ID (例如 1年计划、2年计划各有独立的 planId)
   */
  warrantyPlanId?: string;

  /**
   * Provider SKU (Guardsman 特有)
   * 用于创建正式保险单
   */
  warrantyProviderSku?: string;

  // 扩展字段
  [property: string]: any;
}

/**
 * Cart Line Item
 */
export interface LineItemSchema {
  id: number;
  variant: VariantSchema;
  quantity: number;
  productType: string;
  // ... 其他字段

  /**
   * 保险信息 (可选)
   */
  warrantyItem?: WarrantyItemSchema | null;
}
```

### 4.2 Order 数据结构

#### 4.2.1 Order Line Item Warranty

```typescript
// libs/shared/types/src/types/order-v1.entity.d.ts

/**
 * 订单中的保险信息
 */
export interface WarrantyItemV1 {
  // ============ 通用字段 ============
  /**
   * 保险供应商
   */
  warrantyVendor: 'mulberry' | 'guardsman';

  /**
   * 保险月份
   */
  durationMonths: string;

  /**
   * 保险单价
   */
  warrantyUnitPrice: string;

  /**
   * 保险总价
   */
  warrantyPolicyCost: string;

  /**
   * 保险折扣
   */
  warrantyDiscount: string;

  /**
   * 税费 (由 TaxJar 返回)
   */
  lineTax: string;

  /**
   * Offer ID
   */
  warrantyOfferId: string;

  /**
   * Line Item ID (用于取消保险)
   */
  warrantyLineItemId: string;

  // ============ 保险状态管理 ============
  /**
   * 保险状态 【新增】
   * - pending: 订单已创建但未支付
   * - processing: 订单已支付,等待 Prosuro 返回状态
   * - active: 保险单创建成功
   * - policyCanceled: 订单支付后取消 (全部或部分)
   * - unpaidCanceled: 订单未支付即取消
   * - failed: 保险单创建失败
   */
  warrantyStatus: 'pending' | 'processing' | 'active' | 'policyCanceled' | 'unpaidCanceled' | 'failed';

  /**
   * 已退款金额 【新增】
   * 用于部分取消场景: warrantyUnitPrice × 已取消数量
   * 每次调用取消接口后累加
   */
  warrantyRefundPrice: string;

  // ============ Guardsman 特有字段 ============
  /**
   * Policy ID (Guardsman 特有)
   * 正式保险单号,订单支付后由 Prosuro 返回
   */
  warrantyPolicyId?: string;

  /**
   * Plan ID (Guardsman 特有)
   */
  warrantyPlanId?: string;

  /**
   * Provider SKU (Guardsman 特有)
   */
  warrantyProviderSku?: string;
}

/**
 * Order Line Item
 */
export interface OrderLineItemV1 {
  id: number;
  sku: string;
  quantity: number;
  // ... 其他字段

  /**
   * 保险信息
   */
  warrantyItem?: WarrantyItemV1 | null;
}
```

#### 4.2.2 Order 聚合字段

```typescript
export interface OrderDataV1 {
  id: number;
  number: string;
  // ... 其他字段

  /**
   * 订单总保险金额
   */
  warrantyTotal: string;

  /**
   * 订单保险折扣总额
   */
  warrantyTotalDiscount: string;

  /**
   * 订单行项目
   */
  shipments: OrderShipmentV1[];
}
```

### 4.3 数据迁移映射

#### 4.3.1 Mulberry 数据映射

```typescript
// 旧数据 (现有)
{
  "warranty_items": {
    "warranty_offer_id": "fe215d44-6759-49fb-a12c-923040866732",
    "duration_months": "24",
    "warranty_offer_price": "79.99",
    "warranty_offer_cost": "159.98",
    "warranty_discount": "0.0"
  }
}

// 新数据结构
{
  "warrantyItem": {
    "warrantyVendor": "mulberry",                              // 【新增】固定值
    "warrantyOfferId": "fe215d44-6759-49fb-a12c-923040866732",
    "durationMonths": "24",
    "warrantyOfferPrice": "79.99",                              // 重命名
    "warrantyOfferCost": "159.98",                              // 重命名
    "warrantyDiscount": "0.0"
  }
}
```

#### 4.3.2 Guardsman 数据映射

```typescript
// Prosuro API 返回
{
  "offerId": "offer_abc123",
  "plans": [
    {
      "id": "plan_xyz789",
      "term": 2,                    // 年
      "price": "79.99",
      "providerSku": "GDS-2Y-001"
  }
  ]
}

// 转换为内部数据结构
{
  "warrantyItem": {
    "warrantyVendor": "guardsman",
    "warrantyOfferId": "offer_abc123",
    "warrantyPlanId": "plan_xyz789",
    "durationMonths": "24",         // term * 12
    "warrantyOfferPrice": "79.99",
    "warrantyOfferCost": "159.98",  // price * quantity
    "warrantyProviderSku": "GDS-2Y-001",
    "warrantyDiscount": "0.0",
    "warrantyStatus": "pending",
    "warrantyRefundPrice": "0"
  }
}
```

---

## 5. API 集成方案

### 5.1 Guardsman (Prosuro) API 集成

#### 5.1.1 前端 API - Headless API

**基础配置**

```typescript
// 访问文档: https://connect-dev.prosuro.com/documentation
// 注册: 使用 Castlery 邮箱
// Public Key: j97d8s9sfsd94v6g44dg5h3h6n7s50az

const PROSURO_CONFIG = {
  apiBaseUrl: EcEnv.NEXT_PUBLIC_PROSURO_API_URL,
  publicKey: EcEnv.NEXT_PUBLIC_PROSURO_PUBLIC_KEY,
};
```

**API 1: Cart API - 批量获取保险方案**

```typescript
/**
 * 用途:
 * - 进入购物车时批量获取所有商品的保险方案
 * - 验证已选保险的有效性 (availability & price update)
 */
POST /api/cart

Request:
{
  "lineItems": [
    {
      "uniqueCode": "cart_line_item_unique_code",  // cartLineItem.uniqueCode
      "sku": "SKU-001",
      "price": 1299.99                              // 商品单价 (有销售价用销售价,否则用原价)
    }
  ]
}

Response:
{
  "lineItems": [
    {
      "uniqueCode": "cart_line_item_unique_code",
      "offerId": "offer_abc123",                    // 商品有可用保险 (如为空则不支持保险)
      "plans": [
        {
          "planId": "plan_xyz789",
          "term": 2,                                 // 年限
          "price": 79.99,                            // 保险价格
          "providerSku": "GDS-2Y-001"
        },
        {
          "planId": "plan_xyz790",
          "term": 3,
          "price": 119.99,
          "providerSku": "GDS-3Y-001"
        }
      ]
    }
  ]
}

错误处理:
- 如果 lineItem 没有返回 offerId → 不支持保险
- 如果已选 term 不在 plans 中 → 自动移除保险
- 如果已选 term 的 price 变化 → 更新价格
```

**API 2: Product API - 获取单个商品的保险方案**

```typescript
/**
 * 用途: PDP 页面获取商品可选保险
 */
GET /api/product

Request (Query Params):
{
  "productId": "SPU-001",                   // SPU
  "variantId": "SKU-001",                   // SKU
  "price": 1299.99,
  "productTitle": "Dawson Sofa 2-seat",
  "productDescription": "Living Room > Sofas"  // 商品后台类目
}

Response:
{
  "offerId": "offer_abc123",
  "plans": [
    {
      "planId": "plan_xyz789",
      "term": 2,
      "price": 79.99,
      "displayText": "2 Year Protection - $79.99",
      "providerSku": "GDS-2Y-001",
      "variantId": "SKU-001"
    }
  ]
}
```

**Widget: Plan Selection Modal**

```typescript
/**
 * Prosuro 提供的可配置主题弹窗
 * 用于用户选择保险计划
 */

// 初始化 Widget
await window.Prosuro.init({
  publicKey: PROSURO_CONFIG.publicKey,
});

// 打开选择弹窗
const result = await window.Prosuro.openPlanModal({
  offerId: 'offer_abc123',
});

// 监听事件获取用户选择
window.addEventListener('prosuro:plan-selected', (event) => {
  const { planId, term, price, providerSku } = event.detail;
  // 保存到购物车
});
```

#### 5.1.2 后端 API - Server-to-Service API

**API 3: Register Policy - 创建正式保险单**

```typescript
/**
 * 时机: 订单支付成功后
 * 认证: 使用商户私钥
 */
POST /api/s2s/register-policy

Headers:
{
  "Authorization": "Bearer <MERCHANT_PRIVATE_KEY>",
  "Content-Type": "application/json"
}

Request:
{
  "offerId": "offer_abc123",
  "providerSku": "GDS-2Y-001",              // 从 Cart 存储的数据获取
  "transactionId": "NS-ORDER-12345",        // Order Reference Number
  "transactionLineId": "cart_line_item_unique_code",
  "orderDate": "2026-01-07T12:00:00Z",      // 订单支付完成时间
  "customer": {
    "email": "customer@example.com",
    "phone": "+1234567890",
    "firstName": "John",
    "lastName": "Doe"
  },
  "billingAddress": {
    "line1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94102",
    "country": "US"
  },
  "shippingAddress": {
    // 同上
  }
}

Response (Success):
{
  "policyId": "POL-123456",
  "status": "active",
  "createdAt": "2026-01-07T12:05:00Z"
}

Response (Error):
{
  "error": {
    "code": "POLICY_CREATION_FAILED",
    "message": "Invalid offer ID"
  }
}

重试机制:
- 如果创建失败,后端进行重试 (指数退避,最多 3 次)
- 重试仍失败 → 告警平台通知 + 手动处理
- **重要**: 保险单创建失败会 Block 订单同步至 NS
```

**API 4: Cancel Policy - 取消保险单**

```typescript
/**
 * 时机:
 * - 订单取消 (Order status → Canceled)
 * - 部分取消保险 (未来支持)
 */
POST /api/s2s/cancel-policy

Headers:
{
  "Authorization": "Bearer <MERCHANT_PRIVATE_KEY>",
  "Content-Type": "application/json"
}

Request:
{
  "transactionId": "NS-ORDER-12345",
  "warrantyLineItemIds": [
    "warranty_line_item_id_1",
    "warranty_line_item_id_2"
  ],
  "reason": "Order cancelation",
  "cancelDate": "2026-01-08T10:00:00Z"
}

Response:
{
  "canceledPolicies": [
    {
      "policyId": "POL-123456",
      "status": "canceled",
      "refundAmount": 79.99
    }
  ]
}
```

### 5.2 后端服务封装

#### 5.2.1 Warranty Service 接口设计

```typescript
// libs/shared/services/src/lib/warranty/warranty.service.ts

interface WarrantyService {
  /**
   * 验证购物车中的保险有效性
   */
  validateCartWarranties(cartLineItems: CartLineItem[]): Promise<ValidationResult>;

  /**
   * 创建正式保险单 (订单支付后)
   */
  createWarrantyPolicy(order: Order, lineItem: OrderLineItem): Promise<PolicyResult>;

  /**
   * 取消保险单
   */
  cancelWarrantyPolicy(order: Order, warrantyLineItemIds: string[]): Promise<CancelResult>;

  /**
   * 同步保险信息至 NetSuite
   */
  syncWarrantyToNetSuite(order: Order, warranties: WarrantyItem[]): Promise<void>;
}

// 实现
class GuardsmanWarrantyService implements WarrantyService {
  private httpClient: HttpClient;
  private config: GuardsmanConfig;

  async createWarrantyPolicy(order, lineItem) {
    const { warrantyItem } = lineItem;

    // 1. 构建请求参数
    const params = {
      offerId: warrantyItem.warrantyOfferId,
      providerSku: warrantyItem.warrantyProviderSku,
      transactionId: order.referenceNumber,
      transactionLineId: warrantyItem.warrantyLineItemId,
      orderDate: order.paidAt,
      customer: {
        email: order.email,
        phone: order.phone,
        // ...
      },
      // ...
    };

    // 2. 调用 Prosuro API
    const result = await this.httpClient.post('/api/s2s/register-policy', params, {
      headers: {
        Authorization: `Bearer ${this.config.privateKey}`,
      },
      retry: {
        maxAttempts: 3,
        backoff: 'exponential',
      },
    });

    // 3. 更新订单中的 policyId 和 status
    await this.updateOrderWarranty(order.id, lineItem.id, {
      warrantyPolicyId: result.policyId,
      warrantyStatus: 'active',
    });

    return result;
  }

  // ... 其他方法
}
```

---

## 6. 版本控制与切换策略

### 6.1 Feature Flag 配置

#### 6.1.1 配置结构

```typescript
// packages/monorepo-features/src/lib/features/warranty-config.ts

interface WarrantyMarketConfig {
  region: Region;
  vendor: 'mulberry' | 'guardsman';
  enabledFrom: Date; // 启用时间
  enabledChannels: ('web' | 'pos')[];
}

const warrantyConfigs: WarrantyMarketConfig[] = [
  // CA - Phase 1: Mulberry
  {
    region: Region.CA,
    vendor: 'mulberry',
    enabledFrom: new Date('2026-05-01'),
    enabledChannels: ['web', 'pos'],
  },
  // CA - Phase 2: Guardsman (切换)
  {
    region: Region.CA,
    vendor: 'guardsman',
    enabledFrom: new Date('2026-06-01'), // Mulberry 合同结束前 1 周
    enabledChannels: ['web', 'pos'],
  },
  // US - 直接 Guardsman
  {
    region: Region.US,
    vendor: 'guardsman',
    enabledFrom: new Date('2026-06-01'),
    enabledChannels: ['web', 'pos'],
  },
];

/**
 * 获取当前市场启用的保险供应商
 */
export function getWarrantyVendor(region: Region): 'mulberry' | 'guardsman' | null {
  const now = new Date();
  const activeConfig = warrantyConfigs
    .filter((config) => config.region === region && config.enabledFrom <= now)
    .sort((a, b) => b.enabledFrom.getTime() - a.enabledFrom.getTime())[0];

  return activeConfig?.vendor || null;
}
```

#### 6.1.2 环境变量配置

```bash
# .env.production

# Mulberry (保留,CA Phase 1 使用)
NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN=pk_live_xxxxxxxx
NEXT_PUBLIC_MULBERRY_SDK=https://cdn.getmulberry.com/sdk/v1/mulberry.js

# Guardsman (新增)
NEXT_PUBLIC_GUARDSMAN_ENABLED=true
NEXT_PUBLIC_PROSURO_PUBLIC_KEY=j97d8s9sfsd94v6g44dg5h3h6n7s50az
NEXT_PUBLIC_PROSURO_WIDGET_URL=https://connect.prosuro.com/widget.js
NEXT_PUBLIC_PROSURO_API_URL=https://connect.prosuro.com/api

# 后端 (私钥,不暴露给前端)
PROSURO_MERCHANT_PRIVATE_KEY=sk_live_xxxxxxxx
```

### 6.2 切换场景处理

#### 6.2.1 场景矩阵

| 场景       | 用户操作                                                                         | 数据状态                                    | 处理方式                                         |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------ |
| **场景 1** | PDP 选择 Mulberry 保险<br>→ 切换到 Guardsman<br>→ 点击加车                       | Cart 接收到 Mulberry 参数                   | ❌ 报错提示用户<br>→ 刷新页面                    |
| **场景 2** | Cart 中有 Mulberry 保险<br>→ 切换到 Guardsman<br>→ 刷新购物车                    | Cart 中 `warrantyVendor = mulberry`         | ✅ 自动移除旧保险<br>→ 提示用户重新选择          |
| **场景 3** | Cart 中有 Mulberry 保险<br>→ 切换到 Guardsman<br>→ 未刷新页面<br>→ 点击 Checkout | Cart 中 `warrantyVendor = mulberry`         | ✅ 发起结算时检测<br>→ 自动移除<br>→ 提示用户    |
| **场景 4** | Checkout 流程中<br>→ 切换到 Guardsman<br>→ Place Order                           | Checkout 数据中 `warrantyVendor = mulberry` | ✅ Place Order 时检测<br>→ 提示返回购物车        |
| **场景 5** | 旧订单 (Mulberry) 需要取消保险                                                   | Order 中 `warrantyVendor = mulberry`        | ⚠️ API 失效<br>→ 业务手动在 Mulberry Portal 操作 |

#### 6.2.2 处理代码示例

**场景 1: PDP 加车时检测**

```typescript
// libs/modules/cart/services/src/lib/cart.helper.ts

export const addToCartCommandV2 = createAsyncThunk('cart/addToCartCommandV2', async (payload, { rejectWithValue }) => {
  const { warrantyId } = payload;

  // 如果有 warranty,检查是否匹配当前 vendor
  if (warrantyId) {
    const currentVendor = getWarrantyVendor(getCurrentRegion());

    // 旧保险系统只传了 offerId,新保险需要 planId
    const isOldWarrantyData = !payload.warrantyPlanId;

    if (isOldWarrantyData && currentVendor === 'guardsman') {
      // 新保险上线,但前端缓存了旧保险数据
      return rejectWithValue({
        code: 'WARRANTY_PLAN_UPDATED',
        title: 'Warranty plan updated',
        message: 'Oops, the extended warranty plan you selected changed. Please choose your plan again.',
        action: 'refresh',
      });
    }
  }

  // ... 正常加车逻辑
});
```

**场景 2 & 3: Cart 检测**

```typescript
// libs/modules/cart/domain/src/lib/slice/cart.slice.ts

export const cartSlice = createSliceWithThunks({
  // ...
  extraReducers(builder) {
    builder.addMatcher(
      (action) => getCartLineItems.matchFulfilled(action),
      (state, { payload }) => {
        const currentVendor = getWarrantyVendor(getCurrentRegion());

        // 检查购物车中是否有不匹配的保险
        const hasObsoleteWarranty = payload.lineItems.some(
          (item) => item.warrantyItem?.warrantyVendor !== currentVendor
        );

        if (hasObsoleteWarranty) {
          // 自动移除过期保险
          const obsoleteItems = payload.lineItems.filter(
            (item) => item.warrantyItem && item.warrantyItem.warrantyVendor !== currentVendor
          );

          obsoleteItems.forEach((item) => {
            dispatch(removeWarranty({ cartItemId: item.id }));
          });

          // 提示用户
          dispatch(
            showWarrantyUpdateNotification({
              title: 'Warranty plan updated',
              message: 'Oops, the extended warranty plan you selected changed. Please choose your plan again.',
            })
          );
        }
      }
    );
  },
});
```

**场景 4: Checkout 检测**

```typescript
// libs/modules/checkout/services/src/lib/checkout.helper.ts

export const placeOrderCommand = createAsyncThunk('checkout/placeOrder', async (_, { getState, rejectWithValue }) => {
  const cart = getState().cart;
  const currentVendor = getWarrantyVendor(getCurrentRegion());

  // 检查 checkout 数据中的保险
  const hasObsoleteWarranty = cart.lineItems.some(
    (item) => item.warrantyItem?.warrantyVendor && item.warrantyItem.warrantyVendor !== currentVendor
  );

  if (hasObsoleteWarranty) {
    return rejectWithValue({
      code: 'WARRANTY_PLAN_UPDATED',
      title: 'Warranty plan updated',
      message: 'Oops, the extended warranty plan you selected changed. Please choose your plan again.',
      action: 'Back to cart',
    });
  }

  // ... 正常下单逻辑
});
```

### 6.3 灰度发布策略

#### 6.3.1 发布阶段

**阶段 1: 代码部署 (上线前 2 周)**

- 部署新代码 (Guardsman 支持),但 Feature Flag 关闭
- Mulberry 继续正常工作
- 验证代码部署无问题

**阶段 2: 内部测试 (上线前 1 周)**

- 通过环境变量或内部标识启用 Guardsman
- 内部员工测试完整流程
- 验证切换逻辑正确

**阶段 3: CA Phase 1 上线 (5 月)**

- CA 市场继续使用 Mulberry
- US 市场 Feature Flag 保持关闭
- 监控 Mulberry 运行情况

**阶段 4: Guardsman 切换 (6 月,Mulberry 合同结束前 1 周)**

- CA & US 同步启用 Guardsman
- 监控切换过程中的异常
- 准备回滚方案

**阶段 5: 完全迁移 (6 月 + 1 个月)**

- 所有新订单使用 Guardsman
- 旧订单 (Mulberry) 仅支持查看,不支持新增/修改
- 监控数据一致性

#### 6.3.2 回滚方案

```typescript
// 紧急回滚: 修改 Feature Flag
const warrantyConfigs: WarrantyMarketConfig[] = [
  {
    region: Region.CA,
    vendor: 'mulberry', // 回滚到 Mulberry
    enabledFrom: new Date('2026-06-01'),
    enabledChannels: ['web', 'pos'],
  },
];

// 或通过环境变量快速禁用
NEXT_PUBLIC_GUARDSMAN_ENABLED = false; // 禁用 Guardsman,回退到 Mulberry
```

---

## 7. 前端实现方案

### 7.1 组件重构

#### 7.1.1 Warranty Manager 组件 (新增)

```tsx
// libs/shared/components/src/lib/warranty-manager/warranty-manager.tsx

interface WarrantyManagerProps {
  onLoadSuccess?: () => void;
}

export function WarrantyManager({ onLoadSuccess }: WarrantyManagerProps) {
  const region = useCurrentRegion();
  const vendor = getWarrantyVendor(region);

  if (!vendor) return null;

  if (vendor === 'mulberry') {
    return <MulberryManager loadSuccess={onLoadSuccess} />;
  }

  if (vendor === 'guardsman') {
    return <GuardsmanManager loadSuccess={onLoadSuccess} />;
  }

  return null;
}
```

#### 7.1.2 Guardsman Manager (新增)

```tsx
// libs/shared/components/src/lib/guardsman-manager/guardsman-manager.tsx

export function GuardsmanManager({ loadSuccess }: { loadSuccess?: () => void }) {
  const onLoad = async () => {
    try {
      if (!EcEnv.NEXT_PUBLIC_PROSURO_PUBLIC_KEY) {
        throw new Error('[GuardsmanManager]: Missing Prosuro public key');
      }

      // 初始化 Prosuro Widget
      await window.Prosuro.init({
        publicKey: EcEnv.NEXT_PUBLIC_PROSURO_PUBLIC_KEY,
      });

      logger.info('Prosuro initialized successfully');
      loadSuccess?.();
    } catch (error) {
      logger.error('[GuardsmanManager]: Failed to initialize Prosuro', error);
    }
  };

  return (
    <Script
      src={EcEnv.NEXT_PUBLIC_PROSURO_WIDGET_URL}
      onLoad={onLoad}
      onError={(error) => logger.error('[GuardsmanManager]: Script load failed', error)}
    />
  );
}
```

#### 7.1.3 PDP Warranty Picker (改造)

```tsx
// libs/modules/product/components/src/lib/product-warranty/product-warranty-picker.tsx

export function ProductWarrantyPicker() {
  const dispatch = useAppDispatch();
  const variant = useAppSelector(selectVariant);
  const region = useCurrentRegion();
  const vendor = getWarrantyVendor(region);

  // 根据 vendor 渲染不同的 Picker
  if (vendor === 'mulberry') {
    return <ProductMulberryPicker />;
  }

  if (vendor === 'guardsman') {
    return <ProductGuardsmanPicker />;
  }

  return null;
}

// Guardsman Picker (新增)
function ProductGuardsmanPicker() {
  const variant = useAppSelector(selectVariant);
  const [warrantyPlans, setWarrantyPlans] = useState<GuardsmanPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GuardsmanPlan | null>(null);

  useEffect(() => {
    // 调用 Product API 获取保险方案
    fetchGuardsmanPlans({
      productId: variant.spuId,
      variantId: variant.sku,
      price: variant.listPrice,
      productTitle: variant.name,
      productDescription: variant.categoryPath,
    }).then(setWarrantyPlans);
  }, [variant]);

  const handleSelectPlan = (plan: GuardsmanPlan) => {
    if (selectedPlan?.planId === plan.planId) {
      setSelectedPlan(null);
      dispatch(resetSelectedWarranty());
    } else {
      setSelectedPlan(plan);
      dispatch(
        setSelectedWarranty({
          warrantyVendor: 'guardsman',
          warrantyOfferId: plan.offerId,
          warrantyPlanId: plan.planId,
          durationMonths: String(plan.term * 12),
          warrantyOfferPrice: String(plan.price),
          warrantyProviderSku: plan.providerSku,
        })
      );
    }
  };

  return (
    <Stack>
      <Typography level="h5">Add furniture protection plan</Typography>
      <RadioGroup value={selectedPlan?.planId}>
        {warrantyPlans.map((plan) => (
          <RadioButton
            key={plan.planId}
            value={plan.planId}
            label={`${plan.term} Year${plan.term > 1 ? 's' : ''} - ${formatPrice(plan.price)}`}
            onClick={() => handleSelectPlan(plan)}
          />
        ))}
      </RadioGroup>
    </Stack>
  );
}
```

#### 7.1.4 Cart Warranty Button (改造)

```tsx
// libs/modules/cart/components/src/lib/warranty-inline-button/warranty-inline-button.tsx

export function WarrantyInlineButton({ targetLineItemId }: WarrantyInlineButtonProps) {
  const region = useCurrentRegion();
  const vendor = getWarrantyVendor(region);
  const targetLineItem = useAppSelector((state) => selectCartLineItemById(state, targetLineItemId));

  const handleOpenWarrantyModal = async () => {
    if (vendor === 'mulberry') {
      // 旧逻辑: Mulberry Modal
      await openMulberryModal(targetLineItem);
    } else if (vendor === 'guardsman') {
      // 新逻辑: Prosuro Modal
      await openGuardsmanModal(targetLineItem);
    }
  };

  // 统一渲染
  return <Button onClick={handleOpenWarrantyModal}>Add extended warranty</Button>;
}

// Guardsman Modal (新增)
async function openGuardsmanModal(lineItem: LineItemSchema) {
  // 1. 调用 Cart API 获取 offerId
  const cartApiResult = await fetchGuardsmanCartPlans([
    {
      uniqueCode: lineItem.uniqueCode,
      sku: lineItem.variant.sku,
      price: lineItem.variant.listPrice,
    },
  ]);

  const { offerId, plans } = cartApiResult.lineItems[0];

  if (!offerId || plans.length === 0) {
    toast.error('This product is not eligible for warranty');
    return;
  }

  // 2. 打开 Prosuro 提供的 Modal
  const selectedPlan = await window.Prosuro.openPlanModal({ offerId });

  if (selectedPlan) {
    // 3. 调用加车接口
    await dispatch(
      addWarranty({
        cartItemId: lineItem.id,
        warrantyVendor: 'guardsman',
        warrantyOfferId: offerId,
        warrantyPlanId: selectedPlan.planId,
        durationMonths: String(selectedPlan.term * 12),
        warrantyOfferPrice: String(selectedPlan.price),
        warrantyProviderSku: selectedPlan.providerSku,
      })
    );
  }
}
```

### 7.2 API 调用封装

#### 7.2.1 Guardsman API Client

```typescript
// libs/shared/services/src/lib/warranty/guardsman-api.client.ts

export class GuardsmanApiClient {
  private baseUrl: string;
  private publicKey: string;

  constructor(config: GuardsmanConfig) {
    this.baseUrl = config.apiBaseUrl;
    this.publicKey = config.publicKey;
  }

  /**
   * Cart API: 批量获取保险方案
   */
  async getCartWarranties(lineItems: CartLineItemInput[]): Promise<CartWarrantiesResponse> {
    const response = await fetch(`${this.baseUrl}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Prosuro-Public-Key': this.publicKey,
      },
      body: JSON.stringify({ lineItems }),
    });

    if (!response.ok) {
      logger.error('Guardsman Cart API failed', {
        status: response.status,
        lineItemsCount: lineItems.length,
      });
      throw new Error('Failed to fetch warranty plans');
    }

    return response.json();
  }

  /**
   * Product API: 获取单个商品保险方案
   */
  async getProductWarranties(params: ProductWarrantiesInput): Promise<ProductWarrantiesResponse> {
    const queryString = new URLSearchParams({
      productId: params.productId,
      variantId: params.variantId,
      price: String(params.price),
      productTitle: params.productTitle,
      productDescription: params.productDescription,
    }).toString();

    const response = await fetch(`${this.baseUrl}/api/product?${queryString}`, {
      headers: {
        'X-Prosuro-Public-Key': this.publicKey,
      },
    });

    if (!response.ok) {
      logger.error('Guardsman Product API failed', {
        status: response.status,
        productId: params.productId,
      });
      throw new Error('Failed to fetch product warranties');
    }

    return response.json();
  }
}

// 单例
export const guardsmanApiClient = new GuardsmanApiClient({
  apiBaseUrl: EcEnv.NEXT_PUBLIC_PROSURO_API_URL,
  publicKey: EcEnv.NEXT_PUBLIC_PROSURO_PUBLIC_KEY,
});
```

---

## 8. 后端实现方案

### 8.1 服务架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Order Service                             │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Order Lifecycle Hooks                       │  │
│  │  - onOrderCreated                                      │  │
│  │  - onOrderPaid → createWarrantyPolicy()               │  │
│  │  - onOrderCanceled → cancelWarrantyPolicy()           │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↓                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Warranty Service Factory                     │  │
│  │  getWarrantyService(vendor) → MulberryService |       │  │
│  │                                GuardsmanService        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               Warranty Service Interface                     │
│  - createPolicy(order, lineItem)                            │
│  - cancelPolicy(order, lineItemIds)                         │
│  - syncToNetSuite(order, warranties)                        │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 核心服务实现

#### 8.2.1 Warranty Service Factory

```typescript
// apps/api/src/services/warranty/warranty-service.factory.ts

export class WarrantyServiceFactory {
  private services: Map<string, IWarrantyService>;

  constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {
    this.services = new Map([
      ['mulberry', new MulberryWarrantyService(httpService, configService)],
      ['guardsman', new GuardsmanWarrantyService(httpService, configService)],
    ]);
  }

  getService(vendor: 'mulberry' | 'guardsman'): IWarrantyService {
    const service = this.services.get(vendor);
    if (!service) {
      throw new Error(`Warranty service not found for vendor: ${vendor}`);
    }
    return service;
  }
}
```

#### 8.2.2 Guardsman Service Implementation

```typescript
// apps/api/src/services/warranty/guardsman-warranty.service.ts

@Injectable()
export class GuardsmanWarrantyService implements IWarrantyService {
  private readonly apiBaseUrl: string;
  private readonly privateKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiBaseUrl = configService.get('PROSURO_API_URL');
    this.privateKey = configService.get('PROSURO_MERCHANT_PRIVATE_KEY');
  }

  /**
   * 创建正式保险单
   */
  async createPolicy(order: Order, lineItem: OrderLineItem): Promise<PolicyResult> {
    const { warrantyItem } = lineItem;

    if (!warrantyItem || warrantyItem.warrantyVendor !== 'guardsman') {
      throw new Error('Invalid warranty data for Guardsman');
    }

    const requestBody = {
      offerId: warrantyItem.warrantyOfferId,
      providerSku: warrantyItem.warrantyProviderSku,
      transactionId: order.referenceNumber,
      transactionLineId: warrantyItem.warrantyLineItemId,
      orderDate: order.paidAt,
      customer: {
        email: order.email,
        phone: order.phone,
        firstName: order.billAddress.firstName,
        lastName: order.billAddress.lastName,
      },
      billingAddress: this.formatAddress(order.billAddress),
      shippingAddress: this.formatAddress(order.shipAddress),
    };

    try {
      const response = await this.httpService.post(
```
