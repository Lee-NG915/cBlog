## API Error Code 使用说明

本文档记录 Joyboy 中 API error code 的来源、当前前端处理方式与 Web/POS 差异。

### 一、设计目标

- **后端定义错误事实**：错误码的数值和业务含义来自后端协议/实现，前端只同步已有错误码，不自行发明数值。
- **前端维护用户可见文案(Optional)和交互策略**：前端需要根据不同场景下的 API error code 决定弹窗文案、按钮文案、确认/取消动作、刷新、跳转、列表展示等交互，**并非每一个错误都需要前端维护文案和交互行为，仅针对 PRD 中：定制错误提示弹窗格式的场景、定制错误弹窗 button action handler 等，才需要前端维护文案和交互策略，否则直接使用通用错误提示**。
- **错误解析与业务处理解耦**：RTK Query rejected action 的结构解析应统一，cart / checkout / payment 只关注各自业务恢复动作。
- **Web 与 POS 行为显式区分**：Web 可以使用站点 URL 跳转；POS 需要自己的刷新、回到流程入口或重新加载结算数据策略，不能隐式复用 Web URL。
- **i18n 可预期**：所有会被用户看到的错误文案必须在当前市场 locale 下存在，缺失时应有明确 fallback，而不是展示 raw key。

### 二、为什么前端维护 API Error Message

API error code 是后端给前端的稳定业务信号，但用户看到的错误弹窗不是简单展示后端 message。

实际业务中，同一个接口错误可能需要不同的前端交互，例如：

- checkout 页面命中商品失效错误，需要引导用户回 cart；
- cart 页面命中相同错误，只需要刷新 cart 数据或当前页面；
- 地址错误在 checkout address 页面可以停留当前页，在 payment 页面则需要回到 address 步骤；
- promotion 变化需要提供 `Continue to checkout` 和 `Back to cart` 两个 action；
- 多商品错误需要展示 `invalidLineItems` 列表；
- POS 没有 Web checkout account/cart URL，handler 必须和 Web 分开。

因此前端维护 API error message 的核心原因是：**用后端 error code 匹配前端场景化交互 action**。后端提供错误事实，前端负责结合页面上下文、渠道、i18n 和用户操作完成最终体验。

### 三、当前实现概览

#### 3.1 错误码定义

文件：`libs/config/src/ec-error-codes.ts`

- `EcErrorCode`：少量通用/基础错误。
- `GlobalApiErrorCode`：系统级错误，如系统错误、限流、权限、超时等。
- `OrderErrorCode`：订单域错误。
- `TransactionApiErrorCode`：交易域错误，覆盖 Cart / Checkout / Payment / Promotion 等。
  - `10701xxx`：Cart 侧错误码。
  - `10702xxx`：Checkout 侧错误码。
  - `10703xxx`：Order / Payment 相关交易错误码。
- `OrderAdminErrorCode`：后台订单管理相关错误。

约定：新增或修改错误码时，必须先确认后端协议/实现，再同步到 `ec-error-codes.ts`，保持数值一致。

#### 3.2 监听入口

文件：

- `libs/modules/composite/services/src/api-error.listener.ts`
- `libs/modules/composite/services/src/api-error/cart-api-error.listener.ts`
- `libs/modules/composite/services/src/api-error/checkout-api-error.listener.ts`
- `libs/modules/composite/services/src/api-error/payment-api-error.listener.ts`
- `libs/modules/composite/services/src/api-error/normalize-api-error.ts`
- `libs/modules/composite/services/src/api-error/api-error.presenter.ts`

对外入口：

```ts
setupApiErrorListeners(startListening, { apiModal });
```

Web 与 POS 都会注册这个 listener：

- Web：`apps/web/app/[deviceTheme]/[region]/layout.client.tsx`
- POS：`apps/pos/app/[locale]/layout.tsx`

`api-error.listener.ts` 只负责组合注册，不承载具体业务分支：

```ts
export function setupApiErrorListeners(startListening, { apiModal }) {
  const subscriptions = [
    setupCartApiErrorListener(startListening, { apiModal }),
    setupCheckoutApiErrorListener(startListening, { apiModal }),
    setupPaymentApiErrorListener(startListening, { apiModal }),
  ];

  return () => subscriptions.forEach((unsubscribe) => unsubscribe());
}
```

各层职责：

- `normalize-api-error.ts`：解析 RTK Query rejected action，输出稳定的 `NormalizedApiError` 结构；判断 `isFetchError`、`isConditionAbortError`、`isHttpForbiddenError`，不依赖 modal、window 或 dispatch。
- `api-error.presenter.ts`：封装 `apiModal.warning(...)`，统一维护 `globalError`、`failedToFetchError`、`transactionApiError` 前缀；处理 `customConfirmTextTslKey`、`itemsList`、`onConfirm`、`onCancel`、`beforeClose` 等交互能力。
- `*-api-error.listener.ts`：只做本 domain 的错误码策略编排（匹配 error code 分组 → 选择 handler → 调用 presenter）。
- `*-error.helper.ts`：维护 matcher、code group 和 handler。

#### 3.3 翻译 key

```ts
export const ErrorTranslatePrefix = {
  SYSTEM_INTERNAL_ERROR: 'globalError',
  TRANSACTION_API_ERROR: 'transactionApiError',
  FAILED_TO_FETCH_ERROR: 'failedToFetchError',
};
```

错误文案位于：

```text
packages/monorepo-i18n/src/lib/locales/error/*.json
```

当前状态：

- `en-CA.json` 中已有 `globalError`、`failedToFetchError`、`transactionApiError`、`paymentProcessingError`。
- `en-US.json`、`en-SG.json`、`en-AU.json`、`en-GB.json` 当前为空对象 `{}`。
- i18n 配置按当前 locale 加载 `error/{locale}.json`，非 CA 市场可能缺失用户可见错误文案。

### 四、当前业务错误处理边界

#### 4.1 Cart

文件：`libs/modules/composite/services/src/cart-error.helper.ts`

当前 cart 相关配置包括：

- `CartProcessFailedEvent`：cart 相关 rejected action 集合。
- `needAutoReloadCartDataGroups`：弹窗确认后刷新 cart 数据。
- `needIgnoredCartErrorCodes`：不弹业务错误弹窗，只执行恢复动作。
- `needRemoveCartTokenAndReloadPageErrorCodes`：清理 cart token 后刷新页面。
- `handlersMap`：
  - `autoRefreshCart`
  - `removeCartTokenAndReloadPage`
  - `reloadCartData`

当前注意点：

- recommendation source 的忽略逻辑应基于 `addLineItemToCart.matchRejected` 判断，避免 rejected listener 中误用 fulfilled matcher。

#### 4.2 Checkout

文件：`libs/modules/composite/services/src/checkout-error.helper.ts`

当前 checkout 是最复杂的错误处理域，包含：

- `CheckoutProcessFailedEvent`：checkout/order/promotion/address 相关 rejected action 集合。
- `needRefreshCartOrRedirectToCartCodes`：命中时在 checkout 页面回 cart，非 checkout 页面刷新 cart；同时设置 `confirmHandler`（点击确认）与 `beforeCloseHandler`（任何关闭方式）均触发相同动作，并在 checkout 页面使用 `checkoutConfirm` 按钮文案。涵盖所有商品状态失效、价格变动、库存不足、token 过期等需要离开 checkout 的场景。
- `needRefreshCartOrReloadCheckoutInfoGroups`：checkout 页刷新 checkout info，非 checkout 页刷新 cart。
- `needReloadCheckoutAddressesCodes`：刷新地址列表。
- `checkoutZipcodeErrorCodes`：不同 checkout 步骤行为不同。
- `needReplaceToMethodPageCodes`：回 shipping method。
- `needRefreshCheckoutPromotionCodes`：刷新 checkout 基础信息，并提供取消回 cart。
- `needListingItemsGroups`：弹窗展示 `invalidLineItems`。
- `checkoutHandlersMap`：checkout 相关副作用。

当前 Web/POS 差异：

- `checkout-api-error.listener.ts` 已经用 `accessInPos` 区分 checkout path：
  - POS：`pathname.includes('/checkout')`
  - Web：`pathname.includes('/checkout/')`
- `checkoutHandlersMap.redirectToCart` 在 Web 回 cart，在 POS 回 `posRoutes.discover`。
- `goToCheckoutAccount` 在 Web 跳 checkout account，在 POS reload。
- `updateCheckoutZipcodeAndRedirectToCheckoutAddress` 当前只对 Web 生效。
- `replaceToMethodPage` 在 Web 跳 shipping method，在 POS 刷新 checkout info。

#### 4.3 Payment

文件：`libs/modules/composite/services/src/payment-error.helper.ts`

当前 payment listener 覆盖 Web 部分支付接口和 POS 支付接口：

- `PaymentProcessFailedEvent`：payment 相关 rejected action 集合。
- `needIgnoredPaymentErrorCodes`：当前为空，保留扩展点。
- `needReloadPosPaymentConfigsCodes`：当前包含 `ErrCheckoutCheckoutTokenExpired`，确认后刷新 POS payment configs。
- `paymentErrorHandlersMap.reloadPosPaymentConfigs`：刷新 POS 支付配置。

注意：payment wallet 组件中还有独立的 `usePaymentErrorHandler` 和 `paymentProcessingError` 分类逻辑。API error listener 处理 RTK rejected action 的全局/交易错误；payment wallet handler 处理支付流程内部的 SDK、capture、result-page 语义，两条链路不应混淆。

### 五、已知风险

1. **i18n 文件不完整**

   除 `en-CA.json` 外，其它市场 error locale 为空。非 CA 市场如果触发 API error modal，会依赖 fallback 或默认英文兜底，无法保证业务文案和按钮文案正确。建议将 `en-CA.json` 中已存在的 error namespace 同步到其它市场，并增加脚本或单测校验：listener 使用到的 code 在所有市场都存在，至少要有 `title`、`confirm`，需要展示正文时有 `description`。

2. **POS handler 仍需要逐项验证**

   POS checkout path、redirect 和 replace 已有差异处理，但 zipcode、promotion、token expired 等恢复动作仍需要按 POS 流程逐项验证，避免默认套用 Web 交互。不要让 POS 走 Web URL，例如 `/checkout/account`、`/cart`、Web server absolute URL。

### 六、新增或修改错误码流程

1. 与后端确认错误码数值、业务含义、返回结构和是否携带额外字段。
2. 在 `libs/config/src/ec-error-codes.ts` 中同步 enum。
3. 判断该 code 是否需要前端特殊交互：
   - 忽略不弹窗；
   - 刷新 cart；
   - 清 token 并 reload；
   - 刷新 checkout info；
   - 刷新地址列表；
   - Web 跳转；
   - POS 专属恢复；
   - 弹窗展示 items list；
   - confirm/cancel 不同 action。
4. 在对应 domain helper / strategy 中加入分组。
5. 在所有 `packages/monorepo-i18n/src/lib/locales/error/*.json` 中补文案。
6. 补对应单测或手动回归记录。

### 七、当前文件结构

```text
libs/modules/composite/services/src/
  api-error.listener.ts           # 组合注册，不承载具体业务分支
  api-error/
    normalize-api-error.ts        # 只做错误结构归一化
    api-error.presenter.ts        # 只做 API error modal 呈现适配
    cart-api-error.listener.ts    # Cart 域错误策略
    checkout-api-error.listener.ts  # Checkout 域错误策略
    payment-api-error.listener.ts   # Payment 域错误策略
  cart-error.helper.ts            # Cart matcher、code group、handler
  checkout-error.helper.ts        # Checkout matcher、code group、handler
  payment-error.helper.ts         # Payment matcher、code group、handler
  global-error.helper.ts          # 系统级错误判断
```

### 八、总结

API error code 的维护边界：

- 后端负责定义错误码和错误事实。
- 前端负责同步错误码、维护用户可见文案、匹配场景化交互 action。
- listener 负责业务副作用编排，不应承担底层解析和 modal 细节。
- Web/POS 行为必须显式区分，不能靠 Web handler 兜底 POS。
- i18n 必须覆盖所有当前市场，避免错误场景下展示 raw key 或默认兜底文案。
