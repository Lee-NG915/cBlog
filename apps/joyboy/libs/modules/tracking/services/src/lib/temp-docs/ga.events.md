# GA Event List

> **参考文档**: `libs/modules/tracking/services/src/lib/temp-docs/[abc].events.md`
>
> **前端事件名映射**: `libs/modules/tracking/services/src/lib/events-name/[abc]-events-name.ts`
>
> **数据来源**: `libs/modules/tracking/services/src/lib/triggers/[abc].trigger.ts` → `trackSomeActionEvent`
>
> **Schema 来源**: `libs/modules/tracking/services/src/lib/entity/[abc]-events.schema.ts`
>
> **生成规则**：
>
> - Tracking Events 任何更新（包括：**新增 、 名字变更 、 参数更新 、 trigger 条件变化 、 删除**等操作），都会自动触发 skill `.agents/skills/tracking-event-ops`。skill 会把改动拆到 docs / entity schema / trigger / domain event / listener / UI dispatch 6 个面，并在修改代码前与人工对齐。
>   - **新增事件**：先确认 trigger 场景（DOM 事件 / 生命周期 / IntersectionObserver / 频率 / 去重策略）；再输出 3-piece 同步清单（temp-docs + entity schema + trigger + 关联 listener / UI dispatch）；仅在用户回复 "确认 / go / ok" 后开始改动。
>   - **修改 / 删除事件**：先用 `rg` 在 `libs/ apps/ packages/` 全量检索常量名与 category 字面量，输出 Before / After Diff Report 和下游 caller 命中行；人工确认后按 schema → trigger → listener → domain event → UI dispatch 顺序落地，最后回到本文档。
> - **事件流必须单向，禁止跨层短路**：`UI component → domain(dispatch interaction event） → tracking listener → event trigger → 第三方渠道`。UI / hook 禁止直接 import trigger，也禁止手搓 `event: 'trackEvent'` payload（skill 的 Anti-patterns 红线）。
> - **temp-docs 永远最后更新**：先完成 schema / trigger / listener / UI dispatch，再回写本文档，确保文档反映仓库“当前真实形态”，不是“将会方案”。
> - 每个事件 Schema 统一用 **TS interface** 描述；若已被 GTM Preview 抓到，在 Schema 下紧跟 **Verified `dataLayer.push`**，贴真实 payload 并标注 `gtm.uniqueEventId`，与 [`dataLayer.example.md`](./dataLayer.example.md) 保持单向引用。

---

## ✅ 前端追踪事件

> **GA event name 列说明**：表示该前端事件最终在 GA4 / GTM 报表中对应的 event name。

> [^ga-name-todo]: 这些事件的 GA event name 尚未人工复核、进一步确认后回填。

| #   | 事件名                                                                            | GA event name                                                                                                                | 事件 Schema                                                                            | 触发场景                                                                                                                                                                              | 关联模块                           | 生效渠道  |
| --- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------- |
| 1   | **checkout**                                                                      | `begin_checkout` (step 1) / `add_shipping_info` (step 4) / `add_payment_info` (step 5) ✅；step 2/3 ⚠️ 待确认[^ga-name-todo] | [§ Schema: checkout](#schema-checkout)                                                 | 用户在 checkout funnel 各步骤上报：step 1 进入 checkout / step 2 address 完成 / step 4 shipping method 完成 / step 5 payment method 选定（step 3 reserved 暂无 caller）               | Checkout / Cart                    | Web       |
| 2   | **transaction**                                                                   | `purchase` ⚠️ 待确认[^ga-name-todo]                                                                                          | [§ Schema: purchase](#schema-purchase)                                                 | 订单支付成功后上报，用于 GA enhanced ecommerce purchase 归因与营收分析                                                                                                                | Checkout / Order                   | Web       |
| 3   | **trackEvent** (`zipcode_shipping_calculator`)                                    | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: shipping selector](#schema-shipping-selector)                               | 用户在 PDP / PLP Quickship / Cart / Mini-cart / Cart promotion banner / Checkout 任意入口点击或提交 zipcode shipping calculator 时上报                                                | Product / Search / Cart / Checkout | Web       |
| 4   | **trackEvent** (`refresh_cart`)                                                   | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: refresh cart](#schema-refresh-cart)                                         | 用户在 mini cart / full cart 点击「Refresh」按钮时上报；不等接口响应，每次点击都触发                                                                                                  | Cart                               | Web       |
| 5   | **trackEvent** (`price_change_banner_impression` / `out_stock_banner_impression`) | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: outdated banner impression](#schema-outdated-banner-impression)             | `WebCartItem` 渲染 `<OutDatedNotice />`（`isItemOutdated(item) === true`）后，从 `useEffect` 上报；`isPriceOutdated` 决定上报哪个 category                                            | Cart                               | Web       |
| 6   | **trackEvent** (`add_coupon`)                                                     | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: applied coupon](#schema-applied-coupon)                                     | 用户在 cart / checkout 页成功 apply coupon 后上报                                                                                                                                     | Promotion (Cart / Checkout)        | Web       |
| 7   | **trackEvent** (`coupon_wallet_dropdown_list` / `click_redeemable_voucher`)       | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: click redeemable voucher](#schema-click-redeemable-voucher)                 | 用户在 `<CouponWalletAutocomplete>` 下拉中点击 CREDITS 行（"Redeem X credits"）时上报；点击即触发，先于积分兑换确认 Modal，每次点击都上报                                             | Promotion (Cart / Checkout)        | Web       |
| 8   | **trackEvent** (`pay` / `repay` / `click_payment_method`)                         | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: click payment method](#schema-click-payment-method)                         | 用户在 checkout payment method 页面点击支付方式（Credit Card / PayPal / Google Pay 等）时上报；每次点击都触发，不去重                                                                 | Payment / Checkout                 | Web       |
| 9   | **trackEvent** (`cart_service` / `view_service_guarantee`)                        | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: view service guarantee](#schema-view-service-guarantee)                     | Cart 页面 `<ServiceGurantee />` 区块进入视口并停留 ≥1s 时上报；每次 mount 仅触发一次                                                                                                  | Cart                               | Web       |
| 10  | **trackEvent** (`cart_service` / `click_service_guarantee_policy`)                | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: click service guarantee policy](#schema-click-service-guarantee-policy)     | 用户在 cart service guarantee 卡片内点击 T&Cs / policy 链接时上报；每次点击都触发                                                                                                     | Cart                               | Web       |
| 11  | **trackEvent** (`cart_recommendation` / `view_product_recommendation`)            | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: view product recommendation](#schema-view-product-recommendation)           | Cart / Mini cart DY 推荐组件返回数据并成功渲染后上报；每个 carousel 每页仅首次成功渲染上报一次                                                                                        | Cart                               | Web       |
| 12  | **trackEvent** (`click_place_order`)                                              | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: click place order](#schema-click-place-order)                               | 用户点击「Place order」或「Make payment」按钮时上报；点击即触发，不等 API 响应，每次点击都上报，无去重                                                                                | Payment / Checkout                 | Web       |
| 13  | **trackEvent** (`add_to_cart` / `click`)                                          | `add_to_cart` ✅                                                                                                             | [§ Schema: click atc](#schema-click-atc)                                               | 用户在取消订单（Canceled）的 order history / order details 页点击「Add to cart」按钮时上报；每次点击都触发，无去重                                                                    | Order                              | Web + POS |
| 14  | **trackEvent** (`canceled_order_click` / `click`)                                 | `canceled_order_click` ✅                                                                                                    | [§ Schema: click cancel order](#schema-click-cancel-order)                             | POS 端用户在 sales_history / sales_details 页点击「Cancel order」按钮时上报；每次点击都触发，无去重                                                                                   | Order                              | POS       |
| 15  | **trackEvent** (`canceled_order_view` / `impression`)                             | `canceled_order_view` ✅                                                                                                     | [§ Schema: view canceled order](#schema-view-canceled-order)                           | 用户在 order history 列表中 canceled 订单卡片首次进入视窗并停留 ≥1s 时上报；order details 页加载完成且订单为 canceled 时上报；每个 mount 最多一次                                     | Order                              | Web       |
| 16  | **trackEvent** (`pending_payment_order_view` / `impression`)                      | `pending_payment_order_view` ✅                                                                                              | [§ Schema: view pending payment order](#schema-view-pending-payment-order)             | 用户在 order history 列表中 pending payment processing 订单卡片首次进入视窗并停留 ≥1s 时上报；order details 页加载完成且订单为 pending payment processing 时上报；每个 mount 最多一次 | Order                              | Web       |
| 17  | **trackEvent** (`pending_payment_order_click` / `click`)                          | `pending_payment_order_click` ✅                                                                                             | [§ Schema: click pay order history](#schema-click-pay-order-history)                   | 用户在 order history 列表 / order details 页点击 Pay 按钮时上报；每次点击都上报，无去重；`tag_value` 携带剩余支付倒计时                                                               | Order                              | Web + POS |
| 18  | **trackEvent** (`order_tracking_link_click` / `click`)                            | `order_tracking_link_click` ✅                                                                                               | [§ Schema: order tracking link click](#schema-order-tracking-link-click)               | 用户在 order history / order details 页点击 shipment 区块的 "Track Shipping" 链接时上报；每次点击都上报，无去重                                                                       | Order                              | Web       |
| 19  | **trackEvent** (`view_cart`)                                                      | `view_cart` ⚠️ 待确认[^ga-name-todo]                                                                                         | [§ Schema: view cart](#schema-view-cart)                                               | 用户查看 cart：fullCart 在 `PageClient` mount 且 lineItems 首次非空时触发；miniCart 在 drawer 首次打开且 lineItems 非空时触发；每个 mount 最多一次，刷新会重新触发；空购物车不上报    | Cart                               | Web       |
| 20  | **trackEvent** (`campaign_progress_bar_link_click`)                               | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: campaign progress bar link click](#schema-campaign-progress-bar-link-click) | 用户在 cart price-break progress bar 文案中点击活动链接时上报；点击即触发，每次点击都触发；不补 impression 事件                                                                       | Promotion (Cart)                   | Web       |
| 21  | **trackEvent** (`gwp_add_to_cart`)                                                | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: GWP add to cart](#schema-gwp-add-to-cart)                                   | 用户在 Choose your gift 面板成功选择并加入赠品后上报；每次成功加车都触发；同时触发全局 `add_to_cart`，`atc_type=free_gift`                                                            | Promotion / Cart                   | Web       |
| 22  | **trackEvent** (`choose_free_gift`)                                               | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: Choose Free Gift](#schema-choose-free-gift)                                 | 用户在 cart / mini-cart 点击「Choose your gift」入口并展开礼品选择面板时上报；每次有效展开点击都触发；无 session/page-view 去重                                                       | Promotion (Cart)                   | Web       |
| 23  | **trackEvent** (`click_cart_icon`)                                                | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: click cart icon](#schema-click-cart-icon)                                   | 用户在网站导航栏点击 cart icon 时上报；每次点击都触发；不等待跳转完成；无 session/page-view 去重                                                                                      | Product / CMS Header               | Web       |
| 24  | **trackEvent** (`guardsman_warranty`)                                             | ⚠️ 待确认[^ga-name-todo]                                                                                                     | [§ Schema: guardsman warranty](#schema-guardsman-warranty)                             | CA Guardsman PDP：选 plan（`select_extended_warranty`）、加车带保险（`add_extended_warranty`，position=pdp）；与 Mulberry 已落地场景对齐，Cart popup / remove 等未实现 action 不上报 | Product                            | Web       |

### Schemas

#### Schema: checkout

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/checkout.trigger.ts` → `trackCheckoutActionEvent`
>
> Caller 链路：
>
> - **Step 1**: cart-domain `webInitiatedCheckoutEvent` → `tracking.listener` → `EVENT_GA_CHECKOUT({ checkoutStep: 1, eventId, lineItems, itemTotal })`
> - **Step 2**: UI → `checkoutShippingAddressStepCompletedEvent` → `checkout-tracking.listener` → `EVENT_GA_CHECKOUT({ checkoutStep: 2, eventId })`
> - **Step 3**: reserved（无 caller）
> - **Step 4**: UI → `checkoutShippingMethodStepCompletedEvent({ option })` → `checkout-tracking.listener` → `EVENT_GA_CHECKOUT({ checkoutStep: 4, eventId, option })`（option = SG 是 assemblyPreference / 非 SG 是 selectedServiceType，dispatcher 上游解析）
> - **Step 5**: UI → `checkoutPaymentMethodSelectedForFunnelEvent({ option })` → `checkout-tracking.listener` → `EVENT_GA_CHECKOUT({ checkoutStep: 5, eventId, option })`（option = payment method id）
>
> Payload 类型用 discriminated union 按 step 收窄：step 1 携带 lineItems/itemTotal，step 4/5 携带 option，step 2/3 仅 eventId。

**TS Schema**

```ts
/** GA checkout 事件参数（推送到 GTM dataLayer） */
type GACheckoutEventParameters = {
  /** 实际 push 的事件名，固定为 `checkout` */
  event: 'checkout';
  /** 本次 checkout 事件唯一 ID，格式由 `getEventRandomId('checkout')` 生成 */
  eventId: string;
  ecommerce: {
    /** 当前站点币种，来自 `INTL_CURRENCY` */
    currencyCode: string;
    checkout: {
      actionField: {
        /** Checkout 步骤。当前实现支持 `1 | 2 | 3 | 4 | 5`；Step 1 = 进入 checkout */
        step: 1 | 2 | 3 | 4 | 5;
        /**
         * Step 4：SG 为 assemblyPreference，非 SG 为 selectedServiceType
         * Step 5：paymentMethod
         * 其他步骤：null
         */
        option: string | null;
      };
      /** Step 1 才会上报：进入 checkout 时购物车内商品列表，不包含 Swatch，不包含空商品 */
      products?: Array<{
        /** 商品 SKU */
        id: string;
        /** 商品名称 */
        name: string;
        /** 商品单价，按 GTM 口径转换后的不含税价格，计算方式为 `getOriginalAmount(price)` */
        price: string;
        /** 商品二级分类 */
        category: string;
        /** 商品所属 collection / brand；无值时为 `No Brand` */
        brand: string;
        /** 商品一级分类 */
        dimension1: string;
        /** 库存状态，值如 `IN_STOCK`、`OUT_OF_STOCK`、`IN_STOCK_SOON` */
        dimension2: string;
        /** 商品售价状态，值为 `sale` 或 `full` */
        dimension3: 'sale' | 'full';
        /** 交期；缺货时为 `Long Time`，否则类似 `0-1 weeks`、`1-2 weeks` */
        dimension4: string;
        /** 该商品在购物车中的数量 */
        quantity: number;
        /** 商品折扣金额；如果商品是 sale，则为 `getOriginalAmount(list_price - price)`，否则为空字符串 */
        metric1: string;
      }>;
      /** Step 1 才会上报：商品总额，按 GTM 口径转换后的不含税金额，计算方式为 `getOriginalAmount(itemTotal)` */
      value?: string;
    };
  };
};
```

**Verified `dataLayer.push` (GTM Preview 抓包)**

> 来源 [`dataLayer.example.md`](./dataLayer.example.md)。三个 step 分别在 GTM 容器中映射到 GA4 event `begin_checkout` / `add_shipping_info` / `add_payment_info`。Step 2/3 暂无抓包样本。

```ts
// Step 1 → GA event name: begin_checkout
dataLayer.push({
  event: 'checkout',
  eventId: 'InitiateCheckout_mpw9cpnd54jli',
  ecommerce: {
    currencyCode: 'CAD',
    checkout: {
      actionField: { step: 1, option: null },
      products: [
        {
          id: '54000119-NA',
          name: 'Mori Left/Right Facing 2 Seater Frame',
          price: '2024.00',
          category: 'Modular 2-Seater Sofas',
          brand: 'No Brand',
          dimension1: 'Sofa & Armchairs',
          dimension2: 'IN_STOCK',
          dimension3: 'full',
          dimension4: '4-5 weeks',
          quantity: 1,
          metric1: '',
        },
      ],
      value: '2024.00',
    },
  },
  'gtm.uniqueEventId': 26108,
});

// Step 4 → GA event name: add_shipping_info
dataLayer.push({
  event: 'checkout',
  eventId: 'checkout_mpwbh2j5ld4ko',
  ecommerce: {
    currencyCode: 'CAD',
    checkout: {
      actionField: { step: 4, option: 'SHIPPING_FASTER' },
    },
  },
  'gtm.uniqueEventId': 17919,
});

// Step 5 → GA event name: add_payment_info
dataLayer.push({
  event: 'checkout',
  eventId: 'checkout_mpwbr41dyyss9',
  ecommerce: {
    currencyCode: 'CAD',
    checkout: {
      actionField: { step: 5, option: 'stripe-link-pay' },
    },
  },
  'gtm.uniqueEventId': 20705,
});
```

---

#### Schema: purchase

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/checkout.trigger.ts` → `trackGAPurchaseEvent`
>
> 字段含义待补充。

**TS Schema**

```ts
/** GA purchase (transaction) 事件参数（推送到 GTM dataLayer） */
type GAPurchaseEventParameters = {
  /** 实际 push 的事件名，固定为 `transaction` */
  event: 'transaction';
  /** 本次 purchase 事件唯一 ID，格式由 `getEventRandomId('Purchase')` 生成 */
  eventId: string;
  /** `checkout-confirm` */
  pageContent: string;
  /**  */
  pageProduct: string;
  /**  */
  pageCountry: string;
  /**  */
  pageCat: string;
  /**  */
  pageType: string;
  /**  */
  userID: number | string;
  /**  */
  userStatus: string;
  /**  */
  userType: string;
  /**  */
  userEmail: string;
  /**  */
  userPhone: string;
  /**  */
  userEmail2: string;
  /**  */
  zipcode: string;
  /** currency code */
  currencyCode: string;
  /** order number */
  transactionId: string;
  /** reference number */
  transactionId2: string;
  /** 订单总额，含税含运费（用户支付的订单金额），取值 `(+total).toFixed(2)` */
  transactionTotalsh: string;
  /** `max(订单总额 - 运费 - 服务费, 0)`，取值 `max(total - shipping - serviceFee, 0).toFixed(2)` */
  transactionTotal: string;
  /** 订单估算净额，`max(订单总额 - 运费 - 服务费 - 估算税额, 0)` */
  transactionTotalNet: string;
  /** 订单实际净额，`max(订单总额 - 运费 - 服务费 - 实际税, 0)` */
  transactionTotalNetActualTax: string;
  /** 订单总优惠额（含 coupon 与 Campaign），取绝对值（正数） */
  transactionDiscount: string;
  /** 订单应用的 coupon code，没有则为空 */
  transactionCoupon: string;
  /** 所有应用的 promotion 的 name（多个用 `,` 拼接），没有则为空 */
  transactionPromo: string;
  /**
   * 估算税额 ✍️ —— 会改成后端计算
   * - AU: `amount * 0.1`
   * - SG: `amount * 0.07`
   * - UK: `amount * 0.2`
   * - US/CA: 实际的 additional tax (`tax_total`)
   */
  transactionTax: string;
  /** 实际税额 `tax_total`，包含 excl 和 incl 税费 */
  transactionActualTax: string;
  /** 订单运费 + 服务费销售价（非折后价），取值 `(shippingListPrice + serviceFee).toFixed(2)` */
  transactionShipping: string;
  /** 当前国家 */
  transactionCountry: string;
  /** 订单城市 */
  customerCity: string;
  ecommerce: {
    /** 币种：`USD` / `SGD` / `AUD` / `GBP` / `CAD` */
    currencyCode: string;
    purchase: {
      actionField: {
        /** 订单号，与 `transactionId` 一致 */
        id: string;
        /** 同 `transactionTotalNet` */
        revenue: string;
        /** 运费 + 服务费销售价（同 `transactionShipping`） */
        shipping: string;
        /** 估算税额 ✍️（同 `transactionTax`） */
        tax: string;
        /** coupon code，没有则为空 */
        coupon: string;
      };
      /** 商品数组，过滤 Swatch（同 checkout 事件 trackedProducts） */
      products: Array<{
        /** 商品 SKU */
        id: string;
        /** 商品名称 */
        name: string;
        /** 商品单价，按 GTM 口径转换后的不含税价格 */
        price: string;
        /** 商品二级分类 */
        category: string;
        /** 商品所属 collection / brand；无值时为 `No Brand` */
        brand: string;
        /** 商品一级分类 */
        dimension1: string;
        /** 库存状态，值如 `IN_STOCK`、`OUT_OF_STOCK`、`IN_STOCK_SOON` */
        dimension2: string;
        /** 商品售价状态，值为 `sale` 或 `full` */
        dimension3: string;
        /** 交期；缺货时为 `Long Time`，否则类似 `0-1 weeks`、`1-2 weeks` */
        dimension4: string;
        /** 该商品在购物车中的数量 */
        quantity: number;
        /** 商品折扣金额；sale 时为 `getOriginalAmount(list_price - price)`，否则为空字符串 */
        metric1: string;
      }>;
    };
  };
  /** 订单绑定的销售姓名（新增），未绑定时为空字符串 */
  'eventDetails.position': string;
};
```

**Example**

```ts
const example: GAPurchaseEventParameters = {
  event: 'transaction',
  eventId: 'Purchase_mpulueu4jq7ua',
  pageContent: 'checkout-confirm',
  pageProduct: 'other',
  pageCountry: 'SG',
  pageCat: 'checkout',
  pageType: 'checkout',
  userID: 209239,
  userStatus: 'logged-in',
  userType: 'member',
  userEmail: 'bc65ba4924a6c0afbd090e11619aaf478009f734891a30505dffdae431baa747',
  userPhone: 'a0425c0e60d0c15d0b689c48d0f7b355f63e29dc29c33234cc2dc35501490b4b',
  userEmail2: 'abby.wang@castlery.com',
  zipcode: '537035',
  currencyCode: 'SGD',
  transactionId: 'R118096717',
  transactionId2: '121965983',
  transactionTotalsh: '578.00',
  transactionTotal: '578.00',
  transactionTotalNet: '540.88',
  transactionTotalNetActualTax: '530.28',
  transactionDiscount: '0.00',
  transactionCoupon: '',
  transactionPromo: '',
  transactionTax: '37.12',
  transactionActualTax: '47.72',
  transactionShipping: '0.00',
  transactionCountry: 'SG',
  customerCity: 'Singapore',
  ecommerce: {
    currencyCode: 'SGD',
    purchase: {
      actionField: {
        id: 'R118096717',
        revenue: '540.88',
        shipping: '0.00',
        tax: '37.12',
        coupon: '',
      },
      products: [
        {
          id: 'AS-000447-PM4002-NA',
          name: 'Elliot Dining Chair, Performance Brilliant White (Natural Leg)',
          price: '265.14',
          category: 'Dining Chairs',
          brand: 'Elliot Collection',
          dimension1: 'Chairs & Benches',
          dimension2: 'IN_STOCK',
          dimension3: 'full',
          dimension4: '2-3 weeks',
          quantity: 2,
          metric1: '',
        },
      ],
    },
  },
  'eventDetails.position': 'Jane Doe',
};
```

#### Schema: click payment method

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/payment-events.trigger.ts` → `trackGAClickPaymentMethodEvent`
>
> 调用链：UI `<PaymentMethodsList />` → `payment/paymentMethodClicked` interaction event → `payment-tracking.listener` → `EVENT_GA_CLICK_PAYMENT_METHOD` → GTM dataLayer。
>
> `category` 区分 `pay`（首次创建订单并支付）与 `repay`（首次支付失败后重试 / 从 order history 进入支付）；`label` 使用接口返回的 payment provider。

**TS Schema**

```ts
type GAClickPaymentMethodEventParameters = {
  event: 'trackEvent';
  'eventDetails.category': 'pay' | 'repay';
  'eventDetails.action': 'click_payment_method';
  'eventDetails.label': string;
};
```

**Example**

```ts
const example: GAClickPaymentMethodEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'pay',
  'eventDetails.action': 'click_payment_method',
  'eventDetails.label': 'stripe-online',
};
```

#### Schema: shipping selector

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/shipping-events.trigger.ts` → `trackShippingSelectorEvent`
>
> 调用链：UI → 各业务 domain 的 `*ShippingZipcodeSelectorClicked/Submitted` interaction event → `shipping-tracking.listener` → `EVENT_SHIPPING_SELECTOR` → GTM dataLayer。
>
> `action` 区分点击 vs 提交、入口为 default zipcode 链接 (PDP/PLP) vs shipping calculator 按钮 (cart/checkout)；`label` 区分实际入口表面（含 `_banner` 后缀以单独标识 cart promotion-hint banner 入口）。

**TS Schema**

```ts
/** GA shipping selector 事件参数（推送到 GTM dataLayer） */
type GAShippingSelectorEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `zipcode_shipping_calculator` */
  'eventDetails.category': 'zipcode_shipping_calculator';
  /**
   * 动作类型：
   * - `click_default_zipcode`     PDP/PLP 点击默认 zipcode 链接打开 modal
   * - `click_submit_zipcode`      PDP/PLP 在 modal 中提交 zipcode
   * - `click_shipping_calculator` Cart/Checkout 点击打开 shipping calculator
   * - `submit_shipping_calculator` Cart/Checkout 在 calculator 中提交 zipcode
   */
  'eventDetails.action':
    | 'click_default_zipcode'
    | 'click_submit_zipcode'
    | 'click_shipping_calculator'
    | 'submit_shipping_calculator';
  /**
   * 入口表面：
   * - `PDP`              产品详情页
   * - `PLA`              PLP 普通商品入口（保留枚举）
   * - `Quickship`        PLP Quickship 切换器
   * - `Fullcart`         购物车 action 按钮
   * - `Minicart`         迷你购物车 action 按钮
   * - `Fullcart_banner`  购物车 promotion-hint 横幅
   * - `Minicart_banner`  迷你购物车 promotion-hint 横幅
   * - `Ordersummary`     Checkout 订单摘要修改入口
   */
  'eventDetails.label':
    | 'PDP'
    | 'PLA'
    | 'Quickship'
    | 'Fullcart'
    | 'Minicart'
    | 'Fullcart_banner'
    | 'Minicart_banner'
    | 'Ordersummary';
};
```

**Verified `dataLayer.push` (GTM Preview 抓包)**

> 来源 [`dataLayer.example.md`](./dataLayer.example.md)。抓到的是 Checkout → Ordersummary 入口的 click 与 submit；其它入口（PDP / Quickship / Fullcart / Minicart / \*\_banner）尚未在 example 中验证。

```ts
// 点击打开 shipping calculator（Checkout 订单摘要修改入口）
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'zipcode_shipping_calculator',
  'eventDetails.action': 'click_shipping_calculator',
  'eventDetails.label': 'Ordersummary',
  'gtm.uniqueEventId': 14980,
});

// 在 calculator 中提交 zipcode
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'zipcode_shipping_calculator',
  'eventDetails.action': 'submit_shipping_calculator',
  'eventDetails.label': 'Ordersummary',
  'gtm.uniqueEventId': 18984,
});
```

**(action × label) 映射矩阵**

| 入口（label）     | click action                | submit action                | 派发的 domain event                                                                                |
| ----------------- | --------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `PDP`             | `click_default_zipcode`     | `click_submit_zipcode`       | `productShippingZipcodeSelectorClicked/SubmittedEvent` (`product/domain`)                          |
| `Quickship`       | `click_default_zipcode`     | `click_submit_zipcode`       | `quickshipZipcodeSelectorClicked/SubmittedEvent` (`search/domain`)                                 |
| `Fullcart`        | `click_shipping_calculator` | `submit_shipping_calculator` | `cartShippingZipcodeSelectorClicked/SubmittedEvent({ source: 'Fullcart' })` (`cart/domain`)        |
| `Minicart`        | `click_shipping_calculator` | `submit_shipping_calculator` | `cartShippingZipcodeSelectorClicked/SubmittedEvent({ source: 'Minicart' })` (`cart/domain`)        |
| `Fullcart_banner` | `click_shipping_calculator` | `submit_shipping_calculator` | `cartShippingZipcodeSelectorClicked/SubmittedEvent({ source: 'Fullcart_banner' })` (`cart/domain`) |
| `Minicart_banner` | `click_shipping_calculator` | `submit_shipping_calculator` | `cartShippingZipcodeSelectorClicked/SubmittedEvent({ source: 'Minicart_banner' })` (`cart/domain`) |
| `Ordersummary`    | `click_shipping_calculator` | `submit_shipping_calculator` | `checkoutShippingZipcodeSelectorClicked/SubmittedEvent` (`checkout/domain`)                        |

#### Schema: refresh cart

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts` → `trackRefreshCartEvent`
>
> 调用链：UI (`<CartRefreshButton surface=... />`) → `cart/refreshButtonClicked` interaction event (`cart/domain`) → `cart-tracking.listener` → `EVENT_GA_REFRESH_CART` → GTM dataLayer。
>
> 触发条件：点击即触发，不等 `refreshCart` API 响应；每次点击都上报，无去重。`label` 由 UI 入口直接传入（mini cart vs full cart）。

**TS Schema**

```ts
/** GA refresh_cart 事件参数（推送到 GTM dataLayer） */
type GARefreshCartEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `refresh_cart` */
  'eventDetails.category': 'refresh_cart';
  /**
   * 入口表面：
   * - `miniCart`  迷你购物车 Refresh 按钮
   * - `fullCart`  购物车页 Refresh 按钮
   */
  'eventDetails.label': 'miniCart' | 'fullCart';
};
```

**Example**

```ts
const example: GARefreshCartEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'refresh_cart',
  'eventDetails.label': 'miniCart',
};
```

**入口映射**

| 入口（label） | UI 组件                                                | 派发的 domain event                                                      |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `miniCart`    | `<CartRefreshButton surface="miniCart" />` (mini cart) | `cartRefreshButtonClickedEvent({ surface: 'miniCart' })` (`cart/domain`) |
| `fullCart`    | `<CartRefreshButton surface="fullCart" />` (cart page) | `cartRefreshButtonClickedEvent({ surface: 'fullCart' })` (`cart/domain`) |

---

#### Schema: click cart icon

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts` → `trackGAClickCartIconEvent`
>
> 入口：
>
> - `libs/modules/cms/components/src/header/components/mobile-menu/mobile-menu.tsx`
> - `libs/modules/product/components/src/lib/web-user-bar/web-user-bar.tsx`
>
> Domain event：`cartIconClickedEvent`（`libs/modules/product/domain/src/event/cart-icon-clicked.event.ts`）
>
> 调用链：UI nav cart icon click → `product/cartIconClicked` interaction event → `tracking.listener` → `EVENT_GA_CLICK_CART_ICON` → GTM dataLayer。
>
> 触发条件：网站导航栏 cart icon 点击即触发；不等待路由跳转完成；每次点击都上报；无去重。

**TS Schema**

```ts
/** GA click_cart_icon 事件参数（推送到 GTM dataLayer） */
type GAClickCartIconEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `click_cart_icon` */
  'eventDetails.category': 'click_cart_icon';
};
```

**Example**

```ts
const example: GAClickCartIconEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'click_cart_icon',
};
```

**入口映射**

| 宿主页面 / 视口 | UI 组件                | 派发的 domain event                         |
| --------------- | ---------------------- | ------------------------------------------- |
| Mobile header   | `<MobileMenu>`         | `cartIconClickedEvent()` (`product/domain`) |
| Desktop header  | `<WebUserBar>` cart UI | `cartIconClickedEvent()` (`product/domain`) |

---

#### Schema: view cart

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts` → `trackViewCartEvent`
>
> 调用链：
>
> - **fullCart**: `apps/web/app/[deviceTheme]/[region]/[locale]/cart/page.client.tsx` (`PageClient`) → `cart/viewed` interaction event (`cart/domain`) → `cart-tracking.listener` → `EVENT_GA_VIEW_CART` → GTM dataLayer
> - **miniCart**: `libs/modules/composite/components/.../web-mini-cart.tsx` (`WebMiniCart`) → `cart/viewed` interaction event → 同上
>
> 触发条件：
>
> - fullCart 在 `PageClient` mount 后 `cartRoot.lineItems` 首次为非空时上报；每个 mount 最多一次（用 `viewCartFiredRef` 守卫）。刷新页面重新 mount → 重新触发。
> - miniCart 在 `<WebMiniCart>` drawer 首次打开（`hasOpenedRef` 翻转）且 `cartLineItems` 非空时上报；每个 mount 最多一次。
> - 空购物车（`lineItems` 空数组）：UI 端不 dispatch domain event；listener 兜底再校验一次，仍为空时静默跳过。
> - 商品行通过 `getGAEccFormattedProducts(lineItems)` 组装，与 GA `add` / `checkout` `products` 字段完全对齐（id/name/price/category/brand/dimension1-4/quantity/metric1）。

**TS Schema**

```ts
/** GA view_cart 事件参数（推送到 GTM dataLayer） */
type GAViewCartEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `view_cart` */
  'eventDetails.category': 'view_cart';
  /**
   * 入口表面：
   * - `miniCart`  迷你购物车首次打开
   * - `fullCart`  购物车页 mount
   */
  'eventDetails.label': 'miniCart' | 'fullCart';
  ecommerce: {
    /** 当前站点币种，来自 `INTL_CURRENCY` */
    currencyCode: string;
    cart: {
      /** 购物车内商品行，经 `getGAEccFormattedProducts` 组装 */
      products: Array<{
        /** 商品 SKU */
        id: string;
        /** 商品名称 */
        name: string;
        /** 不含税单价，`getOriginalAmount(price)` */
        price: string;
        /** 二级分类 */
        category: string;
        /** Collection / brand；无值时 `No Brand` */
        brand: string;
        /** 一级分类 */
        dimension1: string;
        /** 库存状态，如 `IN_STOCK`、`OUT_OF_STOCK`、`IN_STOCK_SOON` */
        dimension2: string;
        /** 售价状态，`sale` 或 `full` */
        dimension3: 'sale' | 'full';
        /** 交期，缺货时为 `Long Time`，否则如 `0-1 weeks` */
        dimension4: string;
        /** 购物车内数量 */
        quantity: number;
        /** sale 时为 `getOriginalAmount(list_price - price)`，否则空字符串 */
        metric1: string;
      }>;
    };
  };
};
```

**Example**

```ts
const example: GAViewCartEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'view_cart',
  'eventDetails.label': 'fullCart',
  ecommerce: {
    currencyCode: 'SGD',
    cart: {
      products: [
        {
          id: 'CSL-SOFA-001',
          name: 'Adams 3-seater Sofa',
          price: '999.00',
          category: 'Sofas',
          brand: 'Adams',
          dimension1: 'Living',
          dimension2: 'IN_STOCK',
          dimension3: 'full',
          dimension4: '1-2 weeks',
          quantity: 1,
          metric1: '',
        },
      ],
    },
  },
};
```

**入口映射**

| 入口（label） | UI 组件                                                                                | 派发的 domain event                                                   |
| ------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `miniCart`    | `<WebMiniCart />` (`libs/modules/composite/components/.../web-mini-cart.tsx`)          | `cartViewedEvent({ surface: 'miniCart', lineItems })` (`cart/domain`) |
| `fullCart`    | `<PageClient />` (`apps/web/app/[deviceTheme]/[region]/[locale]/cart/page.client.tsx`) | `cartViewedEvent({ surface: 'fullCart', lineItems })` (`cart/domain`) |

---

#### Schema: click checkout

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts` → `trackClickCheckoutEvent`
>
> 调用链：UI (`<WebCheckoutButton />`) → `cart/checkoutClicked` interaction event (`cart/domain`) → `cart-tracking.listener` → `EVENT_GA_CLICK_CHECKOUT` → GTM dataLayer。
>
> 触发条件：点击 Checkout 按钮即触发，不等待 login / gift / customized item 校验或 `initCheckout` API 响应；每次点击都上报，无去重。`position` 由 UI 入口根据 mini cart mode 显式传入。

**TS Schema**

```ts
/** GA click_checkout 事件参数（推送到 GTM dataLayer） */
type GAClickCheckoutEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `cart_summary` */
  'eventDetails.category': 'cart_summary';
  /** 固定为 `click_checkout` */
  'eventDetails.action': 'click_checkout';
  /** Checkout 按钮所在位置 */
  'eventDetails.position': 'mini_cart' | 'full_cart';
};
```

**Example**

```ts
const example: GAClickCheckoutEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'cart_summary',
  'eventDetails.action': 'click_checkout',
  'eventDetails.position': 'mini_cart',
};
```

**入口映射**

| 入口（position） | UI 组件                             | 派发的 domain event                                                  |
| ---------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `mini_cart`      | `<WebCheckoutButton />` (mini cart) | `cartCheckoutClickedEvent({ position: 'miniCart' })` (`cart/domain`) |
| `full_cart`      | `<WebCheckoutButton />` (cart page) | `cartCheckoutClickedEvent({ position: 'fullCart' })` (`cart/domain`) |

---

#### Schema: outdated banner impression

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/ga-impression-events.trigger.ts` → `trackGAOutdatedBannerImpressionEvent`
>
> 入口：`libs/modules/cart/components/src/lib/web-cart-item/web-cart-item.tsx`（`WebCartItem` 内 `useEffect`）
>
> Domain event：`cartOutdatedBannerImpressionEvent`（`libs/modules/cart/domain/src/lib/events/cart-outdated-banner-impression.event.ts`）

**触发条件**

- `isItemOutdated(item) === true`（即 `item.isPriceOutdated || item.isRegionOutdated || item.stockState === 'OUT_OF_STOCK'`）
- `useEffect` deps：`[isOutdated, item.isPriceOutdated, item.variant?.sku, item.variant?.name, dispatch]`
- 频率：mount 时触发一次；后续仅在上述 deps 变化时再次触发（依赖 React unmount/remount 与 flag 切换天然去重，不做额外 session/page-view 去重）
- 分支：`item.isPriceOutdated === true` → `price_change_banner_impression`；否则 → `out_stock_banner_impression`

**TS Schema**

```ts
/** GA outdated banner impression 事件参数（推送到 GTM dataLayer） */
type GAOutdatedBannerImpressionEventParameters = {
  /** 实际 push 的事件名，固定为 `trackEvent` */
  event: 'trackEvent';
  /**
   * banner 变体：
   * - `price_change_banner_impression`  价格过期 banner
   * - `out_stock_banner_impression`     缺货 / region-outdated banner
   */
  'eventDetails.category': 'price_change_banner_impression' | 'out_stock_banner_impression';
  /** 动态 label，形如 `${variant.sku} | ${variant.name}` */
  'eventDetails.label': string;
};
```

**Example**

```ts
const example: GAOutdatedBannerImpressionEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'price_change_banner_impression',
  'eventDetails.label': 'CAS-SOFA-001-GREY | Madison 3-Seater Sofa - Grey',
};
```

**入口映射**

| 入口（category）                 | UI 组件                                                          | 派发的 domain event                                                                      |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `price_change_banner_impression` | `<WebCartItem />` + `<OutDatedNotice isPriceOutdated={true} />`  | `cartOutdatedBannerImpressionEvent({ kind: 'price_change', sku, name })` (`cart/domain`) |
| `out_stock_banner_impression`    | `<WebCartItem />` + `<OutDatedNotice isPriceOutdated={false} />` | `cartOutdatedBannerImpressionEvent({ kind: 'out_of_stock', sku, name })` (`cart/domain`) |

---

#### Schema: applied coupon

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/coupon-events.trigger.ts` → `trackGAAppliedCouponEvent`
>
> 入口：`libs/modules/composite/components/src/lib/promotion-coupon-wallet/hooks/use-coupon-wallet-adapter.ts`
>
> Domain event：`appliedCouponActionSucceededEvent`（`libs/modules/promotion/domain/src/event/coupon-action-succeeded.event.ts`）
>
> 调用链：UI `<CouponWalletAutocomplete>` → `addCouponToCartCommand` / `addCouponToCheckoutCommand` → `promotion/appliedCouponActionSucceeded` interaction event → `promotion-tracking.listener` → `EVENT_GA_APPLIED_COUPON` → GTM dataLayer。
>
> `category` 由 coupon wallet adapter 根据当前 surface 显式写入 command payload；tracking trigger 不读取 `window.location`，不从 store 补字段。

**触发条件**

- Apply coupon mutation 成功后触发；失败不上报
- 频率：每次成功 apply coupon 都上报；无 session/page-view 去重
- Cart surface 固定上报 `cart_coupon`
- Checkout surface 根据当前 pathname 映射：shipping address / shipping method / payment

**TS Schema**

```ts
/** GA add_coupon 事件参数（推送到 GTM dataLayer） */
type GAAppliedCouponEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 当前 apply coupon surface */
  'eventDetails.category':
    | 'cart_coupon'
    | 'checkout_shipping_address'
    | 'checkout_shipping_method'
    | 'checkout_payment';
  /** 固定为 `add_coupon` */
  'eventDetails.action': 'add_coupon';
  /** 成功 apply 的 coupon code */
  'eventDetails.label': string;
};
```

**Verified `dataLayer.push` (GTM Preview 抓包)**

> 来源 [`dataLayer.example.md`](./dataLayer.example.md)。抓到的是 `checkout_shipping_address` 入口；其它三个入口（`cart_coupon` / `checkout_shipping_method` / `checkout_payment`）尚未在 example 中验证。

```ts
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'checkout_shipping_address',
  'eventDetails.action': 'add_coupon',
  'eventDetails.label': '9KIIHH4B',
  'gtm.uniqueEventId': 13902,
});
```

**入口映射**

| 宿主页面                  | GA category                 | 派发的 domain event                                                                |
| ------------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| Cart / Mini cart          | `cart_coupon`               | `appliedCouponActionSucceededEvent({ couponCode, category })` (`promotion/domain`) |
| Checkout shipping address | `checkout_shipping_address` | `appliedCouponActionSucceededEvent({ couponCode, category })` (`promotion/domain`) |
| Checkout shipping method  | `checkout_shipping_method`  | `appliedCouponActionSucceededEvent({ couponCode, category })` (`promotion/domain`) |
| Checkout payment          | `checkout_payment`          | `appliedCouponActionSucceededEvent({ couponCode, category })` (`promotion/domain`) |

---

#### Schema: click redeemable voucher

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/coupon-events.trigger.ts` → `trackClickRedeemableVoucherEvent`
>
> 入口：`libs/modules/composite/components/src/lib/promotion-coupon-wallet/coupon-wallet-autocomplete/coupon-wallet-autocomplete.tsx`（`onAutoCompleteChange` CREDITS 分支）
>
> Domain event：`redeemableVoucherClickedEvent`（`libs/modules/promotion/domain/src/event/redeemable-voucher-clicked.event.ts`）
>
> 调用链：UI `<CouponWalletAutocomplete>` → `promotion/redeemableVoucherClicked` interaction event → `promotion-tracking.listener` → `EVENT_GA_CLICK_REDEEMABLE_VOUCHER` → GTM dataLayer。
>
> 共享 UI 组件覆盖以下宿主页面：full cart / mini cart / checkout-shipping-address / checkout-shipping-method / checkout-payment。`label` 由 UI 直接传入该行展示的 credits 数量。

**触发条件**

- Autocomplete 下拉中点击某行：`reason === 'selectOption'` 且 `value.type === CouponWalletOptionType.CREDITS`
- 频率：点击即触发，先于 `RedemptionActionModal` 打开；不等 redemption API；无 session/page-view 去重
- 不区分 cart / mini-cart / checkout：datalayer payload 不含 surface 字段

**TS Schema**

```ts
/** GA click_redeemable_voucher 事件参数（推送到 GTM dataLayer） */
type GAClickRedeemableVoucherEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `coupon_wallet_dropdown_list` */
  'eventDetails.category': 'coupon_wallet_dropdown_list';
  /** 固定为 `click_redeemable_voucher` */
  'eventDetails.action': 'click_redeemable_voucher';
  /** 该行展示的 credits 数量（来自 `CouponWalletOption.cost`，stringified） */
  'eventDetails.label': string;
};
```

**Example**

```ts
const example: GAClickRedeemableVoucherEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'coupon_wallet_dropdown_list',
  'eventDetails.action': 'click_redeemable_voucher',
  'eventDetails.label': '200',
};
```

**入口映射**

| 宿主页面                                                                        | UI 组件                                                            | 派发的 domain event                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Full cart / Mini cart / Checkout (shipping-address / shipping-method / payment) | `<CouponWalletAutocomplete>` 下拉 CREDITS 行（"Redeem X credits"） | `redeemableVoucherClickedEvent({ creditsCost })` (`promotion/domain`) |

#### Schema: campaign progress bar link click

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/coupon-events.trigger.ts` → `trackGACampaignProgressBarLinkClickEvent`
>
> 入口：`libs/modules/promotion/components/src/lib/promotion-hint/price-break-hint.tsx`
>
> Domain event：`campaignProgressBarLinkClickedEvent`（`libs/modules/promotion/domain/src/event/campaign-progress-bar-link-clicked.event.ts`）
>
> 调用链：UI `<PriceBreakHint>` → `promotion/campaignProgressBarLinkClicked` interaction event → `promotion-tracking.listener` → `EVENT_GA_CAMPAIGN_PROGRESS_BAR_LINK_CLICK` → GTM dataLayer。

**触发条件**

- Cart 页面 price-break progress bar 存在且文案中的 campaign link 被点击
- 频率：点击即触发；每次点击都上报；无 session/page-view 去重
- 不补 `campaign_progress_bar_impression`：该 impression 事件已从 PRD 删除，本事件只覆盖 link click
- `eventDetails.action`：campaign name / tag / tag_value
- `eventDetails.method`：当前 progress bar discount label

**TS Schema**

```ts
/** GA campaign_progress_bar_link_click 事件参数（推送到 GTM dataLayer） */
type GACampaignProgressBarLinkClickEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `campaign_progress_bar_link_click` */
  'eventDetails.category': 'campaign_progress_bar_link_click';
  /** Campaign name / tag / tag_value */
  'eventDetails.action': string;
  /** 当前 progress bar discount label，例如 `$20 off` */
  'eventDetails.method': string;
};
```

**Example**

```ts
const example: GACampaignProgressBarLinkClickEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'campaign_progress_bar_link_click',
  'eventDetails.action': 'Memorial Day Sale',
  'eventDetails.method': '$20 off',
};
```

**入口映射**

| 宿主页面 | UI 组件            | 派发的 domain event                                                                    |
| -------- | ------------------ | -------------------------------------------------------------------------------------- |
| Cart     | `<PriceBreakHint>` | `campaignProgressBarLinkClickedEvent({ campaignName, discount })` (`promotion/domain`) |

#### Schema: Choose Free Gift

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/coupon-events.trigger.ts` → `trackGAChooseFreeGiftEvent`
>
> 入口：`libs/modules/promotion/components/src/lib/choose-gift-gallery/choose-gift-gallery.tsx`
>
> Domain event：`chooseFreeGiftClickedEvent`（`libs/modules/promotion/domain/src/event/choose-free-gift-clicked.event.ts`）
>
> 调用链：UI `<ChooseGiftGallery>` header click → `promotion/chooseFreeGiftClicked` interaction event → `promotion-tracking.listener` → `EVENT_GA_CHOOSE_FREE_GIFT` → GTM dataLayer。

**触发条件**

- Cart / Mini-cart 中 `Choose your gift` 入口从关闭态点击展开时触发
- 频率：每次有效展开点击都上报；无 session/page-view 去重
- 仅 campaign gift 入口上报；change gift / coupon gift 不上报
- `eventDetails.label`：`miniCart` / `fullCart`
- `eventDetails.position`：free-gift campaign action result position，例如 `A` / `B`
- `position` 缺失时 UI 不派发 domain event，避免上报不完整 payload

**TS Schema**

```ts
/** GA choose_free_gift 事件参数（推送到 GTM dataLayer） */
type GAChooseFreeGiftEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `choose_free_gift` */
  'eventDetails.category': 'choose_free_gift';
  /** Cart surface */
  'eventDetails.label': 'miniCart' | 'fullCart';
  /** Free gift campaign action result position */
  'eventDetails.position': string;
};
```

**Example**

```ts
const example: GAChooseFreeGiftEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'choose_free_gift',
  'eventDetails.label': 'fullCart',
  'eventDetails.position': 'A',
};
```

**入口映射**

| 宿主页面             | UI 组件               | 派发的 domain event                                                                              |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| Cart / Mini-cart Web | `<ChooseGiftGallery>` | `chooseFreeGiftClickedEvent({ label: 'miniCart' \| 'fullCart', position })` (`promotion/domain`) |

#### Schema: GWP add to cart

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/coupon-events.trigger.ts` → `trackGAGwpAddToCartEvent`
>
> 入口：`libs/modules/promotion/components/src/lib/gift-item/gift-item.tsx`（由父层 `GiftGallery` 成功加车路径承接）
>
> Domain event：`addedGiftActionSucceededEvent`（`libs/modules/cart/domain/src/lib/events/cart-action-succeeded.event.ts`）
>
> 调用链：UI `<GiftItem>` Add to cart → `GiftGallery` → `addGiftToCartCommand` 成功 → `cart/addedGiftActionSucceeded` interaction event → `cart-tracking.listener` → `EVENT_GA_GWP_ADD_TO_CART` + `EVENT_GA_ADD_TO_CART(atcType: 'free_gift')` → GTM dataLayer。

**触发条件**

- Choose your gift 面板中点击 gift 的 Add to cart
- `addGiftToCartCommand` 成功后触发；失败不上报
- 频率：每次成功加入赠品都上报；无 session/page-view 去重
- 同时触发全局 `add_to_cart`，并通过 `atc_type: 'free_gift'` 标识来源，避免归入普通商品 ATC 分析口径
- `eventDetails.label`：`miniCart` / `fullCart`
- `eventDetails.gift_id`：gift sku；sku 不可用时 fallback 到 variant id

**TS Schema**

```ts
/** GA gwp_add_to_cart 事件参数（推送到 GTM dataLayer） */
type GAGwpAddToCartEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `gwp_add_to_cart` */
  'eventDetails.category': 'gwp_add_to_cart';
  /** 固定为 legacy GWP action `cart_event` */
  'eventDetails.action': 'cart_event';
  /** Add gift surface */
  'eventDetails.label': 'miniCart' | 'fullCart';
  /** Gift sku；sku 不可用时 fallback 到 variant id */
  'eventDetails.gift_id': string;
};
```

**Example**

```ts
const example: GAGwpAddToCartEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'gwp_add_to_cart',
  'eventDetails.action': 'cart_event',
  'eventDetails.label': 'fullCart',
  'eventDetails.gift_id': '54000001-NA',
};
```

**入口映射**

| 宿主页面              | UI 组件      | 派发的 domain event                                                                                      |
| --------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| Choose your gift 面板 | `<GiftItem>` | `addedGiftActionSucceededEvent({ giftId, campaignName: 'cart_event', label, tracking })` (`cart/domain`) |

#### Schema: view product recommendation

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/ga-impression-events.trigger.ts` → `trackGAViewProductRecommendationEvent`
>
> 入口：`libs/modules/composite/components/src/lib/cart-dy-recommendations/cart-dy-recommendations.tsx`
>
> Domain event：`cartProductRecommendationImpressionEvent`（`libs/modules/cart/domain/src/lib/events/cart-product-recommendation-impression.event.ts`）
>
> 调用链：UI `<CartDYRecommendations miniCart=...>` → `<DYRecommendationCarousel onRenderSuccess=...>` → DY fulfilled 且有 slots / header → `cart/productRecommendationImpression` interaction event → `cart-tracking.listener` → `EVENT_GA_VIEW_PRODUCT_RECOMMENDATION` → GTM dataLayer。

**触发条件**

- DY 推荐组件返回数据成功，且 `slots.length > 0`
- 推荐组件标题存在并成功渲染
- 频率：**per page view / per carousel once** —— `CartDYRecommendations` 用 selector name 去重；刷新页面后可重新触发
- `eventDetails.label`：推荐组件标题，例如 `Customers also purchased these`
- `eventDetails.position`：Mini cart 输出 `mini_cart`；Full cart 输出 `full_cart`；其它来源预留 `others`

**TS Schema**

```ts
type GAViewProductRecommendationEventParameters = {
  event: 'trackEvent';
  'eventDetails.category': 'cart_recommendation';
  'eventDetails.action': 'view_product_recommendation';
  'eventDetails.label': string;
  'eventDetails.position': 'mini_cart' | 'full_cart' | 'others';
};
```

**Verified `dataLayer.push` (GTM Preview 抓包)**

> 来源 [`dataLayer.example.md`](./dataLayer.example.md)。抓到的是 `full_cart` 入口、推荐位标题为 `Customers also purchased these`。`mini_cart` / `others` 入口尚未在 example 中验证。

```ts
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'cart_recommendation',
  'eventDetails.action': 'view_product_recommendation',
  'eventDetails.label': 'Customers also purchased these',
  'eventDetails.position': 'full_cart',
  'gtm.uniqueEventId': 27145,
});
```

**入口映射**

| 宿主页面  | UI 组件                              | 派发的 domain event                                                         |
| --------- | ------------------------------------ | --------------------------------------------------------------------------- |
| Mini cart | `<CartDYRecommendations miniCart />` | `cartProductRecommendationImpressionEvent({ label, position: 'miniCart' })` |
| Full cart | `<CartDYRecommendations />`          | `cartProductRecommendationImpressionEvent({ label, position: 'fullCart' })` |

#### Schema: view service guarantee

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/ga-impression-events.trigger.ts` → `trackGAViewServiceGuaranteeEvent`
>
> 入口：`libs/modules/cart/components/src/lib/cart-service-guarantee-impression/cart-service-guarantee-impression.tsx`（wrapper 包住共享 `<ServiceGurantee />`）
>
> Domain event：`cartServiceGuaranteeImpressionEvent`（`libs/modules/cart/domain/src/lib/events/cart-service-guarantee-impression.event.ts`）
>
> 调用链：UI `<CartServiceGuaranteeImpression position="fullCart">` → `useInViewDelayedCallback`（≥1s dwell，`hasFired` ref 去重）→ `cart/serviceGuaranteeImpression` interaction event → `cart-tracking.listener` → `EVENT_GA_VIEW_SERVICE_GUARANTEE` → GTM dataLayer。
>
> 宿主页面：当前仅 full cart page。`miniCart` enum 已在 schema / domain event 中预留，待 mini cart UI 接入时新增 dispatch 即可。

**触发条件**

- Cart 页面 `<ServiceGurantee />` 整块进入视口（默认 `IntersectionObserver` `threshold: 0.5`）
- 停留 ≥1s 后回调触发
- 频率：**once per mount** —— wrapper 内 `hasFiredRef` 去重，避免反复滚入滚出重复上报；不做 cross-page-view 去重

**TS Schema**

```ts
/** GA view_service_guarantee 事件参数（推送到 GTM dataLayer） */
type GAViewServiceGuaranteeEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `cart_service` */
  'eventDetails.category': 'cart_service';
  /** 固定为 `view_service_guarantee` */
  'eventDetails.action': 'view_service_guarantee';
  /** 区分 cart surface：`fullCart` 已接入；`miniCart` 预留 */
  'eventDetails.position': 'miniCart' | 'fullCart';
};
```

**Example**

```ts
const example: GAViewServiceGuaranteeEventParameters = {
  event: 'trackEvent',
  'eventDetails.category': 'cart_service',
  'eventDetails.action': 'view_service_guarantee',
  'eventDetails.position': 'fullCart',
};
```

**入口映射**

| 宿主页面       | UI 组件                                                    | 派发的 domain event                                             |
| -------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| Full cart page | `<CartServiceGuaranteeImpression position="fullCart">`     | `cartServiceGuaranteeImpressionEvent({ position: 'fullCart' })` |
| Mini cart      | （未接入，待 UI 加上 `<ServiceGurantee />` 后补 dispatch） | `cartServiceGuaranteeImpressionEvent({ position: 'miniCart' })` |

#### Schema: click service guarantee policy

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/ga-impression-events.trigger.ts` → `trackGAClickServiceGuaranteePolicyEvent`
>
> 入口：`libs/modules/cart/components/src/lib/cart-service-guarantee-impression/cart-service-guarantee-impression.tsx`（wrapper 包住共享 `<ServiceGurantee />`）
>
> Domain event：`cartServiceGuaranteePolicyClickedEvent`（`libs/modules/cart/domain/src/lib/events/cart-service-guarantee-policy-clicked.event.ts`）
>
> 调用链：UI `<CartServiceGuaranteeImpression position="fullCart">` → service guarantee 卡片内 policy / T&Cs 链接 click → `cart/serviceGuaranteePolicyClicked` interaction event → `cart-tracking.listener` → `EVENT_GA_CLICK_SERVICE_GUARANTEE_POLICY` → GTM dataLayer。
>
> 宿主页面：当前仅 full cart page。`miniCart` source position 已在 domain event / trigger 中支持，待 mini cart UI 接入 `<CartServiceGuaranteeImpression position="miniCart">` 即可。

**触发条件**

- 用户点击 cart service guarantee 卡片内的 `<a>` 链接（T&Cs / policy）
- 频率：**every click** —— 不 debounce / throttle / dedup；不等待新 tab 打开结果
- `eventDetails.label`：取被点击卡片的 title，例如 `Eco delivery`
- `eventDetails.position`：trigger 将 cart domain 的 `fullCart` / `miniCart` 映射为 GA payload 的 `full_cart` / `mini_cart`

**TS Schema**

```ts
/** GA click_service_guarantee_policy 事件参数（推送到 GTM dataLayer） */
type GAClickServiceGuaranteePolicyEventParameters = {
  /** 固定为通用 trackEvent 通道 */
  event: 'trackEvent';
  /** 固定为 `cart_service` */
  'eventDetails.category': 'cart_service';
  /** 固定为 `click_service_guarantee_policy` */
  'eventDetails.action': 'click_service_guarantee_policy';
  /** 点击卡片 title，例如 `Eco delivery` */
  'eventDetails.label': string;
  /** 区分 cart surface：`full_cart` 已接入；`mini_cart` 预留 */
  'eventDetails.position': 'mini_cart' | 'full_cart';
};
```

**Verified `dataLayer.push` (GTM Preview 抓包)**

> 来源 [`dataLayer.example.md`](./dataLayer.example.md)。抓到的 `position` 为 `full_cart`，`label` 为 `30-day returns` 卡片。`mini_cart` 入口尚未在 example 中验证。

```ts
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'cart_service',
  'eventDetails.action': 'click_service_guarantee_policy',
  'eventDetails.label': '30-day returns',
  'eventDetails.position': 'full_cart',
  'gtm.uniqueEventId': 27761,
});
```

**入口映射**

| 宿主页面       | UI 组件                                                    | 派发的 domain event                                                                       |
| -------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Full cart page | `<CartServiceGuaranteeImpression position="fullCart">`     | `cartServiceGuaranteePolicyClickedEvent({ label: '<card title>', position: 'fullCart' })` |
| Mini cart      | （未接入，待 UI 加上 `<ServiceGurantee />` 后补 dispatch） | `cartServiceGuaranteePolicyClickedEvent({ label: '<card title>', position: 'miniCart' })` |

#### Schema: click place order

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/payment-events.trigger.ts` → `trackGAClickPlaceOrderEvent`
>
> 调用链：UI `<PaymentWallets />` 所有支付入口（Stripe/GrabPay/2C2P 提交按钮、PayPal/Affirm SDK `onInitiate`、Express checkout `placeOrderHandler`）→ `payment/placeOrderClicked` interaction event → `payment-tracking.listener` → `EVENT_GA_CLICK_PLACE_ORDER` → GTM dataLayer。
>
> 触发条件：点击即触发，不等 API 响应；每次点击都上报，无去重。`category` 为当前选中的 payment method provider；`label` 区分首次/重试场景。

**TS Schema**

```ts
type GAClickPlaceOrderEventParameters = {
  event: 'trackEvent';
  'eventDetails.action': 'click_place_order';
  /** 当前选中的 payment method provider，例如 `stripe-online` */
  'eventDetails.category': string;
  /**
   * - `checkout_place_order`   首次从 checkout 页发起支付
   * - `checkout_retry_payment` 从 checkout 页重试支付（已有 orderInfo 或 resumeState.failure）
   * - `order_retry_payment`    从 order history 页重试支付（source === 'orderCheckout'）
   */
  'eventDetails.label': 'checkout_place_order' | 'checkout_retry_payment' | 'order_retry_payment';
};
```

**Example**

```ts
const example: GAClickPlaceOrderEventParameters = {
  event: 'trackEvent',
  'eventDetails.action': 'click_place_order',
  'eventDetails.category': 'stripe-online',
  'eventDetails.label': 'checkout_place_order',
};
```

**入口映射**

| 入口             | 支付方式                            | 触发点                                                                                                        |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 提交按钮         | Stripe / GrabPay / 2C2P             | `<PaymentSubmitSection onSubmit>` 包装后的 `activeSubmitHandler`                                              |
| SDK slot         | PayPal / Affirm                     | `<PaypalPaymentElement onInitiate>` / `<AffirmPaymentElement onInitiate>` 包装后的 `trackedPrepareSdkPayment` |
| Express checkout | Apple Pay / Google Pay (via Stripe) | `<ExpressCheckoutElement placeOrderHandler>` 包装后的 `stablePlaceOrder`                                      |

#### Schema: click atc

> **GA event name**: `add_to_cart` ✅（PRD New Format 约定 `eventDetails.category` 即 GA event name）
>
> PRD: [Order Component PRD - Event Tracking (New Format)](https://castlery.atlassian.net/wiki/spaces/PM/pages/4066574379)（第一表 add_to_cart）
>
> 数据来源：`libs/modules/tracking/services/src/lib/triggers/order-events.trigger.ts` → `trackGAClickAtcEvent`
>
> 入口：`libs/modules/order/components/src/lib/order-history-atc-button/order-history-atc-button.tsx`
>
> Domain event：`orderHistoryAtcClickedEvent`（`libs/modules/order/domain/src/event/order-history-atc-clicked.event.ts`）
>
> 调用链：UI `<OrderHistoryAtcButton />` onClick → `order/orderHistoryAtcClicked` interaction event → `order-tracking.listener` → `EVENT_GA_CLICK_ATC` → GTM dataLayer。
>
> 生效范围：Web 和 POS 均接入（`setupOrderTrackingListeners` 无 `accessInWeb` guard）。

**触发条件**

- 用户点击 `<OrderHistoryAtcButton />` 内的「Add to cart」按钮（仅 canceled 订单卡片渲染该按钮）
- 触发时机：进入 `handleAddToCart`，通过重复点击防护（`isSubmittingRef.current`）后立即派发，不等 `batchAddToCartCommand` API 响应
- 频率：**每次点击都上报**，无 session / page-view 去重

> ⚠ PRD 约定 category=`add_to_cart` 与 PDP/Cart 标准 `add_to_cart` 在 GA bucket 中合并，已与 PM 对齐。

**TS Schema**

```ts
type GAClickAtcEventParameters = {
  event: 'trackEvent';
  'eventDetails.category': 'add_to_cart';
  'eventDetails.page_component': 'canceled_order';
  'eventDetails.label': 'add_to_cart';
  'eventDetails.action': 'click';
};
```

**Verified `dataLayer.push`**

```ts
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'add_to_cart',
  'eventDetails.page_component': 'canceled_order',
  'eventDetails.label': 'add_to_cart',
  'eventDetails.action': 'click',
});
```

**入口映射**

| 宿主页面           | 端  | UI 组件                                                | 派发的 domain event                          |
| ------------------ | --- | ------------------------------------------------------ | -------------------------------------------- |
| Order history 列表 | Web | `<OrderHistoryAtcButton isWebOrderDetailPage=false />` | `orderHistoryAtcClickedEvent()` (无 payload) |
| Order details 详情 | Web | `<OrderHistoryAtcButton isWebOrderDetailPage=true />`  | `orderHistoryAtcClickedEvent()` (无 payload) |
| Order history 列表 | POS | `<OrderHistoryAtcButton />`                            | `orderHistoryAtcClickedEvent()` (无 payload) |

---

#### Schema: click pay order history

> **GA event name**: `pending_payment_order_click` ✅（PRD New Format 约定 `eventDetails.category` 即 GA event name）
>
> PRD: [Order Component PRD - Event Tracking (New Format)](https://castlery.atlassian.net/wiki/spaces/PM/pages/4066574379)（第一表 pending_payment_order_click）
>
> 调用链：UI `<WebOrderHistoryCountDown />` → `order/orderHistoryPayClicked` interaction event → `order-tracking.listener` → `trackGAClickPayOrderHistoryEvent` → GTM dataLayer。
>
> 生效范围：Web + POS（listener 无 `accessInWeb` guard）。

**触发条件**：用户在 order history / order details 页点击 Pay 按钮时触发；每次点击都上报，不去重。`tag_value` 携带剩余支付倒计时（HH:MM:SS）。

**TS Schema**

```ts
type GAClickPayOrderHistoryEventParameters = {
  event: 'trackEvent';
  'eventDetails.category': 'pending_payment_order_click';
  'eventDetails.page_component': 'pending_payment_order';
  'eventDetails.label': 'pay';
  'eventDetails.action': 'click';
  'eventDetails.tag': 'remaining_payment_time';
  'eventDetails.tag_value': string; // e.g. '00:29:08'
};
```

**Verified `dataLayer.push`**

```ts
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'pending_payment_order_click',
  'eventDetails.page_component': 'pending_payment_order',
  'eventDetails.label': 'pay',
  'eventDetails.action': 'click',
  'eventDetails.tag': 'remaining_payment_time',
  'eventDetails.tag_value': '00:29:08',
});
```

**入口映射**

| 宿主页面           | 端  | UI 组件                              | 派发的 domain event                                         |
| ------------------ | --- | ------------------------------------ | ----------------------------------------------------------- |
| Order history 列表 | Web | `<WebOrderHistoryCountDown />` (Pay) | `orderHistoryPayClickedEvent({ remainingTime: countdown })` |

---

#### Schema: click cancel order

> **GA event name**: `canceled_order_click` ✅（PRD New Format 约定 `eventDetails.category` 即 GA event name）
>
> PRD: [Order Component PRD - Event Tracking (New Format)](https://castlery.atlassian.net/wiki/spaces/PM/pages/4066574379)（第一表 canceled_order_click）
>
> 调用链：UI `<OrderHistoryCancelOrderBtn />` → `order/orderHistoryCancelOrderClicked` interaction event → `order-tracking.listener` → `trackGAClickCancelOrderEvent` → GTM dataLayer。
>
> 生效范围：POS only（caller 内 `if (accessInPos)` 守卫）。

**触发条件**：POS 端用户点击 Cancel order 按钮时触发，每次点击都上报，不去重。

> ⚠ PRD 原文 page_component 写为 `pending_payment_order`（笔误），已与 PM 对齐改为 `canceled_order`。

**TS Schema**

```ts
type GAClickCancelOrderEventParameters = {
  event: 'trackEvent';
  'eventDetails.category': 'canceled_order_click';
  'eventDetails.page_component': 'canceled_order';
  'eventDetails.label': 'cancel_order';
  'eventDetails.action': 'click';
};
```

**入口映射**

| 宿主页面           | 端  | UI 组件                          | 派发的 domain event                                  |
| ------------------ | --- | -------------------------------- | ---------------------------------------------------- |
| Sales history 列表 | POS | `<OrderHistoryCancelOrderBtn />` | `orderHistoryCancelOrderClickedEvent()` (无 payload) |
| Sales details 页   | POS | `<OrderHistoryCancelOrderBtn />` | `orderHistoryCancelOrderClickedEvent()` (无 payload) |

---

#### Schema: view canceled order

> **GA event name**: `canceled_order_view` ✅（PRD New Format 约定 `eventDetails.category` 即 GA event name）
>
> PRD: [Order Component PRD - Event Tracking (New Format)](https://castlery.atlassian.net/wiki/spaces/PM/pages/4066574379)（第一表 canceled_order_view）
>
> 调用链：UI `<WebOrderInfoOverviewV1 />` mount / 首次曝光 → `order/orderCanceledViewed` interaction event → `order-tracking.listener` （`accessInWeb` 守卫）→ `trackGAViewCanceledOrderEvent` → GTM dataLayer。
>
> 生效范围：Web only（listener `accessInWeb` 守卫，POS silently drop）。

**触发条件**

- 列表（order history）：`<WebOrderInfoOverviewV1 isOrderListPage={true}>` 在 canceled 订单卡片上挂载根 `<Box>` 的 `useFirstInViewWithDelay` ref，元素首次连续停留视窗 ≥1s 触发一次；离开再回不再触发，整次 mount 期间最多一次。
- Web 详情（order details）：`<WebOrderInfoOverviewV1 isOrderListPage` 未设时，`useEffect` 在 `order.status === 'CANCELED'` 时挂载即派发；通过 `hasFiredDetailsRef` 在该 mount 内只派发一次。
- POS 守卫：`pos-sales-order-details.tsx` 同样渲染该组件，会派发 `orderCanceledViewedEvent`，但 `order-tracking.listener` `accessInWeb` 守卫使其不发往 GTM。
- 频率：每个 mount 至多一次；刷新 / back-forward 重新 mount 会重新派发；无跨 mount / session 去重。

**TS Schema**

```ts
type GAViewCanceledOrderEventParameters = {
  event: 'trackEvent';
  'eventDetails.category': 'canceled_order_view';
  'eventDetails.page_component': 'canceled_order';
  'eventDetails.action': 'impression';
};
```

**Verified `dataLayer.push`**

```ts
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'canceled_order_view',
  'eventDetails.page_component': 'canceled_order',
  'eventDetails.action': 'impression',
});
```

**Hook**

- 列表场景复用公共 hook：`libs/modules/tracking/components/src/lib/hooks/useFirstInViewWithDelay.tsx`
- 组合 `IntersectionObserver` + setTimeout：进入视野启动计时器，离开清除；满足 `delay` 后 `hasFired` 置 true 并 `disconnect`，保证不重复触发。

**入口映射**

| 宿主页面           | 端  | UI 组件                                             | 派发的 domain event                                         |
| ------------------ | --- | --------------------------------------------------- | ----------------------------------------------------------- |
| Order history 列表 | Web | `<WebOrderInfoOverviewV1 isOrderListPage={true} />` | `orderCanceledViewedEvent()` — 仅 canceled 订单卡片上挂 ref |
| Order details 详情 | Web | `<WebOrderInfoOverviewV1 />`                        | `orderCanceledViewedEvent()`                                |
| Sales details 详情 | POS | `<WebOrderInfoOverviewV1 />`                        | 同上派发，但 listener `accessInWeb` 守卫静默丢弃            |

---

#### Schema: view pending payment order

> **GA event name**: `pending_payment_order_view` ✅（PRD New Format 约定 `eventDetails.category` 即 GA event name）
>
> PRD: [Order Component PRD - Event Tracking (New Format)](https://castlery.atlassian.net/wiki/spaces/PM/pages/4066574379)（第一表 pending_payment_order_view）
>
> 调用链：UI `<WebOrderInfoOverviewV1 />` mount / 首次曝光 → `order/orderPendingPaymentViewed` interaction event → `order-tracking.listener` （`accessInWeb` 守卫）→ `trackGAViewPendingPaymentOrderEvent` → GTM dataLayer。
>
> 生效范围：Web only（listener `accessInWeb` 守卫，POS silently drop）。

**触发条件**

- 列表（order history）：`<WebOrderInfoOverviewV1 isOrderListPage={true}>` 在 `order.status === 'PENDING_PAYMENT' && isPayProcessing` 的订单卡片上挂载根 `<Box>` 的 `useFirstInViewWithDelay` ref，元素首次连续停留视窗 ≥1s 触发一次；离开再回不再触发，整次 mount 期间最多一次。
- Web 详情（order details）：`<WebOrderInfoOverviewV1 isOrderListPage` 未设时，`useEffect` 在 `order.status === 'PENDING_PAYMENT' && isPayProcessing` 时挂载即派发；通过 `hasFiredPendingPaymentDetailsRef` 在该 mount 内只派发一次。
- POS 守卫：`pos-sales-order-details.tsx` 同样渲染该组件，会派发 `orderPendingPaymentViewedEvent`，但 `order-tracking.listener` `accessInWeb` 守卫使其不发往 GTM。
- 频率：每个 mount 至多一次；刷新 / back-forward 重新 mount 会重新派发；无跨 mount / session 去重。

**TS Schema**

```ts
type GAViewPendingPaymentOrderEventParameters = {
  event: 'trackEvent';
  'eventDetails.category': 'pending_payment_order_view';
  'eventDetails.page_component': 'pending_payment_order';
  'eventDetails.action': 'impression';
};
```

**Verified `dataLayer.push`**

```ts
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'pending_payment_order_view',
  'eventDetails.page_component': 'pending_payment_order',
  'eventDetails.action': 'impression',
});
```

**入口映射**

| 宿主页面           | 端  | UI 组件                                             | 派发的 domain event                                                                 |
| ------------------ | --- | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Order history 列表 | Web | `<WebOrderInfoOverviewV1 isOrderListPage={true} />` | `orderPendingPaymentViewedEvent()` — 仅 pending payment processing 订单卡片上挂 ref |
| Order details 详情 | Web | `<WebOrderInfoOverviewV1 />`                        | `orderPendingPaymentViewedEvent()`                                                  |
| Sales details 详情 | POS | `<WebOrderInfoOverviewV1 />`                        | 同上派发，但 listener `accessInWeb` 守卫静默丢弃                                    |

---

#### Schema: order tracking link click

> **GA event name**: `order_tracking_link_click` ✅（PRD New Format 约定 `eventDetails.category` 即 GA event name）
>
> PRD: [Order Component PRD - Event Tracking (New Format)](https://castlery.atlassian.net/wiki/spaces/PM/pages/4066574379)（第一表 order_tracking_link_click）
>
> 数据来源：`libs/modules/tracking/services/src/lib/triggers/order-events.trigger.ts` → `trackGAOrderTrackingLinkClickEvent`
>
> 入口：`libs/modules/order/components/src/lib/web-order-line-items/order-shipment-state/order-shipment-state-v1.tsx`
>
> Domain event：`orderTrackingLinkClickedEvent`（`libs/modules/order/domain/src/event/order-tracking-link-clicked.event.ts`）
>
> 调用链：UI `<OrderShipmentStateV1 />` "Track Shipping" `<Link>` onClick → `order/orderTrackingLinkClicked` interaction event → `order-tracking.listener` （`accessInWeb` 守卫）→ `trackGAOrderTrackingLinkClickEvent` → GTM dataLayer。
>
> 生效范围：Web only（listener `accessInWeb` 守卫）。

**触发条件**

- 用户在 order history 列表或 order details 页 shipment 区块（`isShipped === true`，即 `shipment.status === 'DISPATCHED'`）点击 "Track Shipping" 链接
- 每次点击都上报，不去重；不阻塞链接跳转。

**TS Schema**

```ts
type GAOrderTrackingLinkClickEventParameters = {
  event: 'trackEvent';
  'eventDetails.category': 'order_tracking_link_click';
  'eventDetails.page_component': 'tracking_link';
  'eventDetails.label': 'tracking_link';
  'eventDetails.action': 'click';
};
```

**Verified `dataLayer.push`**

```ts
dataLayer.push({
  event: 'trackEvent',
  'eventDetails.category': 'order_tracking_link_click',
  'eventDetails.page_component': 'tracking_link',
  'eventDetails.label': 'tracking_link',
  'eventDetails.action': 'click',
});
```

**入口映射**

| 宿主页面           | 端  | UI 组件                    | 派发的 domain event               |
| ------------------ | --- | -------------------------- | --------------------------------- |
| Order history 列表 | Web | `<OrderShipmentStateV1 />` | `orderTrackingLinkClickedEvent()` |
| Order details 详情 | Web | `<OrderShipmentStateV1 />` | `orderTrackingLinkClickedEvent()` |

---

## Schema: Add To Cart

> **GA event name**: `add_to_cart` ✅（已在 [`dataLayer.example.md`](./dataLayer.example.md) 中通过 GTM Preview 验证）
>
> **数据来源**：`libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts` → `trackGAAddedToCartEvent`（ORP 版本，由 listener 编排其他渠道）
>
> **调用链**：UI cart action → cart-domain `addedCartActionSucceededEvent` / `updatedCartQtyActionSucceededEvent` → `cart-tracking.listener` → `dispatchAddToCartTrackingEvents` → `EVENT_GA_ADD_TO_CART({ targetLineItem, quantityDifference, customer, atcType })` → GTM dataLayer。
>
> 与旧 `trackAddToCartEvent` 不同，ORP 路径在 listener 集中编排 GA / FB / Pinterest / DY / Klaviyo 五个渠道，每个 lineItem 的 `quantityDifference` 由 cart-domain 上游计算后传入。

**触发条件**

- `addedCartActionSucceededEvent`：用户首次将商品加入购物车
- `updatedCartQtyActionSucceededEvent`：购物车内商品 +qty（数量增加才上报 `add_to_cart`，减少走 `remove_from_cart`）
- `addedGiftActionSucceededEvent`：用户成功加入赠品时上报 `add_to_cart`，`atc_type=free_gift`
- Swatch 走独立 swatch trigger，不进入 ATC trigger
- 频率：每次成功 ATC / 加数量都上报；无去重
- `atcType` 由上游 caller 显式传入：`'regular'`（默认）/ `'1click'`（一键加购）/ `'ai'`（GenAI Casa）/ `'free_gift'`（赠品加车）
- `userStatus` / `userEmail` / `userEmail2` 由 listener 注入当前登录态

**TS Schema**

```ts
/** GA add_to_cart 事件参数（推送到 GTM dataLayer） */
type GAAddToCartEventParameters = {
  /** 实际 push 的事件名，固定为 `addToCart` */
  event: 'addToCart';
  /** 本次 ATC 事件唯一 ID，格式由 `getEventRandomId('addToCart')` 生成；与 FB CAPI 共享 */
  eventId: string;
  /** 用户登录状态：`'logged-in'` / `'logged-out'` */
  userStatus: 'logged-in' | 'logged-out';
  /** SHA-256 hash 后的 email（PII 保护），未登录为空字符串 */
  userEmail: string;
  /** 明文 email（用于 GTM 内的 CDP 集成），未登录为空字符串 */
  userEmail2: string;
  /** ATC 入口类型 */
  atc_type: 'regular' | '1click' | 'ai' | 'free_gift' | 'GenAI Casa';
  /** 位置标识（当前实现未用到，保留占位） */
  eventDetails: { position: string };
  ecommerce: {
    /** 当前站点币种，来自 `INTL_CURRENCY` */
    currencyCode: string;
    add: {
      /** 加入购物车的商品，单一元素数组（按 lineItem 维度上报） */
      products: Array<{
        /** 商品 SKU */
        id: string;
        /** 商品名称 */
        name: string;
        /** 不含税单价，`getOriginalAmount(price)` */
        price: string;
        /** 二级分类 */
        category: string;
        /** Collection / brand；无值时 `No Brand` */
        brand: string;
        /** 一级分类 */
        dimension1: string;
        /** 库存状态，如 `IN_STOCK`、`OUT_OF_STOCK`、`IN_STOCK_SOON` */
        dimension2: string;
        /** 售价状态，`sale` 或 `full` */
        dimension3: 'sale' | 'full';
        /** 交期，缺货时为 `Long Time`，否则如 `0-1 weeks` */
        dimension4: string;
        /** 本次增加的数量（quantityDifference） */
        quantity: number;
        /** sale 时为 `getOriginalAmount(list_price - price)`，否则空字符串 */
        metric1: string;
        /** 折扣后总价（按 GTM 口径），`getOriginalAmount(price)` */
        metric2: string;
      }>;
    };
  };
};
```

**Verified `dataLayer.push` (GTM Preview 抓包)**

> 来源 [`dataLayer.example.md`](./dataLayer.example.md)。

```ts
dataLayer.push({
  event: 'addToCart',
  eventId: 'addToCart_mpw976fhwwtgx',
  userStatus: 'logged-out',
  userEmail: '',
  userEmail2: '',
  atc_type: 'regular',
  eventDetails: { position: '' },
  ecommerce: {
    currencyCode: 'CAD',
    add: {
      products: [
        {
          id: '54000119-NA',
          name: 'Mori Left/Right Facing 2 Seater Frame',
          price: '2024.00',
          category: 'Modular 2-Seater Sofas',
          brand: 'No Brand',
          dimension1: 'Sofa & Armchairs',
          dimension2: 'IN_STOCK',
          dimension3: 'full',
          dimension4: '4-5 weeks',
          quantity: 1,
          metric1: '',
          metric2: '2024.00',
        },
      ],
    },
  },
  'gtm.uniqueEventId': 8976,
});
```

**入口映射**

| Domain event                         | 派发场景                                       | listener 行为                                                                                  |
| ------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `addedCartActionSucceededEvent`      | 用户首次将一个 lineItem 加入购物车             | `dispatchAddToCartTrackingEvents({ targetLineItem, quantityDifference, customer, atcType })`   |
| `updatedCartQtyActionSucceededEvent` | 用户在 cart / mini-cart 增加现有 lineItem 数量 | 同上；`quantityDifference` 为增量（减量场景走 `remove_from_cart`）                             |
| `addedGiftActionSucceededEvent`      | 用户成功将赠品加入购物车                       | `EVENT_GA_ADD_TO_CART({ targetLineItem, quantityDifference, customer, atcType: 'free_gift' })` |

---

## Schema: Remove From Cart

> **GA event name**: `remove_from_cart` ✅（已在 [`dataLayer.example.md`](./dataLayer.example.md) 中通过 GTM Preview 验证）
>
> **数据来源**：`libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts` → `trackGARemoveFromCartEvent`（ORP 版本）
>
> **调用链**：UI cart remove / qty- → cart-domain `removedCartActionSucceededEvent` → `cart-tracking.listener` → `dispatchRemoveFromCartTrackingEvents` → `EVENT_GA_REMOVE_FROM_CART({ lineItem, quantityDifference })` → GTM dataLayer。

**触发条件**

- 用户在 cart / mini-cart 删除某个 lineItem，或 -qty
- Swatch 不上报（被 listener 过滤掉）
- 频率：每次成功 remove / 减数量都上报；无去重
- `quantityDifference` 为负数（移除多少个，即 `-removedQuantity`）

**TS Schema**

```ts
/** GA remove_from_cart 事件参数（推送到 GTM dataLayer） */
type GARemoveFromCartEventParameters = {
  /** 实际 push 的事件名，固定为 `removeFromCart` */
  event: 'removeFromCart';
  ecommerce: {
    /** 当前站点币种，来自 `INTL_CURRENCY` */
    currencyCode: string;
    remove: {
      /** 被移除的商品，单一元素数组 */
      products: Array<{
        /** 商品 SKU */
        id: string;
        /** 商品名称 */
        name: string;
        /** 不含税单价，`getOriginalAmount(price)` */
        price: string;
        /** 二级分类 */
        category: string;
        /** Collection / brand；无值时 `No Brand` */
        brand: string;
        /** 一级分类 */
        dimension1: string;
        /** 库存状态 */
        dimension2: string;
        /** 售价状态 */
        dimension3: 'sale' | 'full';
        /** 交期 */
        dimension4: string;
        /** 本次移除的数量（正数表示移除了多少个） */
        quantity: number;
        /** sale 时为 `getOriginalAmount(list_price - price)`，否则空字符串 */
        metric1: string;
        /** 折扣后总价的负值（按 GTM 口径用来表示流失金额），形如 `-199.00` */
        metric2: string;
      }>;
    };
  };
};
```

**Verified `dataLayer.push` (GTM Preview 抓包)**

> 来源 [`dataLayer.example.md`](./dataLayer.example.md)。

```ts
dataLayer.push({
  event: 'removeFromCart',
  ecommerce: {
    currencyCode: 'CAD',
    remove: {
      products: [
        {
          id: '54000001-TL4002',
          name: 'Joshua Chair, Pearl Beige',
          price: '199.00',
          category: 'Dining Chairs',
          brand: 'Joshua Collection',
          dimension1: 'Joshua Collection',
          dimension2: 'IN_STOCK',
          dimension3: 'sale',
          dimension4: '1-2 weeks',
          quantity: 1,
          metric1: '237.00',
          metric2: '-199.00',
        },
      ],
    },
  },
  'gtm.uniqueEventId': 36478,
});
```

**入口映射**

| Domain event                      | 派发场景                                                                   | listener 行为                                                               |
| --------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `removedCartActionSucceededEvent` | 用户在 cart / mini-cart 删除 lineItem 或减少数量；listener 兜底过滤 swatch | `dispatchRemoveFromCartTrackingEvents({ targetLineItem, removedQuantity })` |

---

## Schema: Add To Wishlist

> **GA event name**: `add_to_wishlist` ✅（已在 [`dataLayer.example.md`](./dataLayer.example.md) 中通过 GTM Preview 验证）
>
> **数据来源**：`libs/modules/tracking/services/src/lib/triggers/wish-list.trigger.ts` → `trackAddToWishlistEvent`
>
> **调用链**：UI 直接 dispatch（PDP `<ProductLike>` / search `<TheLookCarousel>` / recommendation carousel `<ProductItem>` / `<ProductItemV2>`）→ `trackAddToWishlistEvent` → 串行触发 FB CAPI → Pinterest CAPI → GA → DY 四个渠道；不走 domain event，直接由 UI 在 `addWishlist.initiate` 成功后调用。

**触发条件**

- 用户在 PDP / 推荐位 / search the-look 等 UI 入口点击爱心按钮且后端 `addWishlist` mutation 成功
- 频率：每次成功 add 都上报；无去重；删除 wishlist 不上报
- `variant` 缺失时 trigger 内部短路返回，不上报
- `productPrice` 取自 `numberVariantPrice`（前端计算的当前实际售价），如为 0 / null 会以 `null` push 上去（example 中观察到 `productPrice: null`）

**TS Schema**

```ts
/** GA add_to_wishlist 事件参数（推送到 GTM dataLayer） */
type GAAddToWishlistEventParameters = {
  /** 实际 push 的事件名，固定为 `trackEvent` */
  event: 'trackEvent';
  /** 本次 add-to-wishlist 事件唯一 ID，与 FB CAPI / Pinterest CAPI 共享 */
  eventId: string;
  /** 固定为 `Ecommerce` */
  'eventDetails.category': 'Ecommerce';
  /** 固定为 `Wish-list`（注意：Pascal-Case + 连字符，沿用旧 GTM 容器 tag 命名） */
  'eventDetails.action': 'Wish-list';
  /** 形如 `${variant.sku} | ${variant.name}` */
  'eventDetails.label': string;
  /** 当前站点币种，来自 `INTL_CURRENCY` */
  currencyCode: string;
  /** 商品名称 */
  productName: string;
  /** 商品当前售价（前端计算），可能为 `null`（example 中观察到的形态） */
  productPrice: number | null;
  /** 商品 SKU 数组（当前实现固定单元素） */
  productCode: string[];
};
```

**Verified `dataLayer.push` (GTM Preview 抓包)**

> 来源 [`dataLayer.example.md`](./dataLayer.example.md)。注意 `productPrice` 抓包时为 `null`，需后续与 trigger 内 `+payload.variant.price` 的行为对齐（疑似上游 caller 传入 `price: undefined` 时 `+undefined → NaN`，被 GTM 序列化为 `null`）。

```ts
dataLayer.push({
  event: 'trackEvent',
  eventId: 'AddToWishlist_mpwb9du9cdbjc',
  'eventDetails.category': 'Ecommerce',
  'eventDetails.action': 'Wish-list',
  'eventDetails.label': '40550224 | Casa Dining Table',
  currencyCode: 'CAD',
  productName: 'Casa Dining Table',
  productPrice: null,
  productCode: ['40550224'],
  'gtm.uniqueEventId': 30866,
});
```

**入口映射**

| 宿主页面                | UI 组件                                                                                     | 调用方式                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| PDP                     | `<ProductLike>` (`libs/modules/product/components/.../product-like.tsx`)                    | `addWishlist.initiate` 成功后直接 `dispatch(EVENT_ADD_TO_WISHLIST({ variant }))`   |
| Recommendation carousel | `<ProductItem>` / `<ProductItemV2>` (`libs/shared/components/.../recommendation-carousel/`) | 同上                                                                               |
| Search the-look         | `tracking-middleware.ts` (`libs/modules/search/components/.../tracking/`)                   | RTK middleware 监听 wishlist add 后 `dispatch(EVENT_ADD_TO_WISHLIST({ variant }))` |

---

#### Schema: guardsman warranty

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/guardsman-warranty-events.trigger.ts` → `trackGuardsmanWarrantyEvent`
>
> 调用链（遵循单向 event flow）：
>
> - **PDP 选 plan**：`ProductGuardsmanPicker` → `guardsmanWarrantyInteractionEvent` → `product-tracking.listener` → `EVENT_GUARDSMAN_WARRANTY`
> - **PDP 加车带保险**：`ProductAddToCart` → `guardsmanWarrantyInteractionEvent` → `product-tracking.listener` → `EVENT_GUARDSMAN_WARRANTY`
>
> 与 Mulberry 对齐范围：仅上述两类已落地 action；trigger JSDoc 中的 `remove_extended_warranty` / `open_popup` / `not_interested_popup` 及 Cart popup 路径均不在 Guardsman 实现。

**TS Schema**

```ts
type GuardsmanWarrantyGaAction =
  | 'select_extended_warranty' // ProductGuardsmanPicker
  | 'add_extended_warranty'    // ProductAddToCart（position=pdp）
  | 'extended_warranty_faq';   // Mulberry 有 FAQ；Guardsman 无对应 UI，不 dispatch

type GuardsmanWarrantyTriggerPayload = {
  action: GuardsmanWarrantyGaAction;
  label?: string;
  sku: string;
  skuName: string;
  position?: 'pdp';
  price?: number | string;
};
```

**Verified dataLayer.push**（结构示意，待 GTM Preview 复核）

```js
{
  event: 'trackEvent',
  eventDetails: {
    category: 'guardsman_warranty',
    action: 'select_extended_warranty',
    label: '2 Years',
    sku_id: 'SOFA-001',
    sku_name: 'Test Sofa',
    position: 'pdp',
    price: '99.00',
  },
}
```

---

## 本次 Open Questions 处理结果

1. 已补充 `eventId`：`trackCheckoutActionEvent` 通过 `getEventRandomId('checkout')` 生成并上报。
2. 已对齐 `option`：无 step-specific option 时上报 `null`，Step 4 / Step 5 有值时上报对应字符串。
3. 已收窄 `products`：`getProductsNeedTracking` 会过滤空商品，`products` 不再包含 `null`。
4. Purchase 事件字段含义待业务方/data team 补充（schema 与 md 已留空注释占位）。
