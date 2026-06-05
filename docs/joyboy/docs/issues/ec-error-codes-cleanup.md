# ec-error-codes.ts 未使用 Error Code 清理

**状态**: `todo`  
**文件**: `libs/config/src/ec-error-codes.ts`  
**分析日期**: 2026-05-06

---

## 背景

通过全量扫描 joyboy 前端代码库（排除 `node_modules`、`dist`、`.git` 及定义文件本身），整理出当前未被任何前端文件引用的 error code，评估后可安全移除，以减少死代码、降低维护成本。

**注意**：`GlobalApiErrorCode` 整体通过 `Object.values(GlobalApiErrorCode)` 使用（见 `global-error.helper.ts`），不可单独移除任何成员，不在本次清理范围内。

---

## 待移除清单

### 1. EcErrorCode（部分成员）

| 成员        | 值      | 说明             |
| ----------- | ------- | ---------------- |
| `SUCCESS`   | `0`     | 未被任何文件引用 |
| `NOT_FOUND` | `40009` | 未被任何文件引用 |

**保留**：`ZIPCODE_FAILURE`（10701015 zipcode.slice.ts）、`SPECIAL_ZIPCODE_FAILURE`（zipcode-failure-modal.tsx）

---

### 2. OrderErrorCode（整个 enum）

整个 enum 未被任何前端文件引用，可整体移除。

| 成员                 | 值         | 说明   |
| -------------------- | ---------- | ------ |
| `ErrorOrderNotExist` | `10502001` | 未引用 |

---

### 3. TransactionApiErrorCode — Cart 段 未使用成员

| 成员                                                 | 值         |
| ---------------------------------------------------- | ---------- |
| `ErrSwatchMoreThanThree`                             | `10701003` |
| `ErrSingleSwatchMoreThanTwo`                         | `10701004` |
| `ErrSwatchOneOrderInThePastTwoWeeks`                 | `10701005` |
| `ErrSummaryCacheNotGenerated`                        | `10701006` |
| `ErrEmptyLineItems`                                  | `10701007` |
| `ErrQtyRemainderIsNotZero`                           | `10701008` |
| `ErrMultipleItemsLessThanMinSaleQty`                 | `10701009` |
| `ErrMultipleItemsMoreThanMaxSaleQty`                 | `10701010` |
| `ErrMultipleItemsUnequalQtyIncrements`               | `10701011` |
| `ErrMultipleItemsQtyRemainderIsNotZero`              | `10701012` |
| `ErrDeletedItem`                                     | `10701013` |
| `ErrTerminalNotForSale`                              | `10701014` |
| `ErrLatestSalePriceNotEqualToCartPrice`              | `10701016` |
| `ErrItemOutOfStock`                                  | `10701017` |
| `ErrItemLTChanged`                                   | `10701018` |
| `ErrPromotionAmountChanged`                          | `10701020` |
| `ErrFreeGiftConditionMetButNotSelected`              | `10701021` |
| `ErrCustomizedItem`                                  | `10701023` |
| `ErrItemIsActive`                                    | `10701024` |
| `ErrMultipleItemsDeletedItem`                        | `10701025` |
| `ErrMultipleItemsNotEnabled`                         | `10701026` |
| `ErrMultipleItemsTerminalNotForSale`                 | `10701027` |
| `ErrMultipleItemsOutOfStock`                         | `10701028` |
| `ErrMultipleItemsLTChanged`                          | `10701029` |
| `ErrMultipleItemsCustomizedItem`                     | `10701030` |
| `ErrMultipleItemsIsActive`                           | `10701031` |
| `ErrNotLogin`                                        | `10701032` |
| `ErrMultipleItemsLatestSalePriceNotEqualToCartPrice` | `10701033` |
| `ErrCartQtyExceedsLimit`                             | `10701034` |
| `ErrLoginRequiredForCoupons`                         | `10701035` |
| `ErrCheckoutTokenExpired`                            | `10701036` |
| `ErrProductNotAvailableInZipCode`                    | `10701038` |
| `ErrMergeFailed`                                     | `10701040` |
| `ErrTransferFailed`                                  | `10701041` |
| `ErrInvalidProduct`                                  | `10701044` |
| `ErrBatchAddLineItemsAllFailed`                      | `10702045` |
| `ErrBatchAddLineItemsPartialFailed`                  | `10702046` |
| `ErrGiftQuantityImmutable`                           | `10702047` |

**Cart 段保留成员**：`ErrLessThanMinSaleQty`、`ErrMoreThanMaxSaleQty`、`ErrUnequalQtyIncrements`、`ErrItemNotEnabled`、`ErrCouponInvalid`、`ErrGiftInvalid`、`ErrZipCodeNotInDeliveryArea`、`ErrAddressIsDeleted`、`ErrCartCacheExpired`、`ErrLineItemsDeleted`

---

### 4. TransactionApiErrorCode — Checkout 段 未使用成员

| 成员                                            | 值         | 备注                                                   |
| ----------------------------------------------- | ---------- | ------------------------------------------------------ |
| `ErrCheckoutItemLTChanged`                      | `10702009` |                                                        |
| `ErrCheckoutMultipleItemsLTChanged`             | `10702018` |                                                        |
| `ErrCheckoutSummaryCacheNotGenerated`           | `10702021` |                                                        |
| `ErrCheckoutEmptyLineItems`                     | `10702022` |                                                        |
| `ErrCheckoutQtyRemainderIsNotZero`              | `10702023` |                                                        |
| `ErrCheckoutMultipleItemsQtyRemainderIsNotZero` | `10702024` |                                                        |
| `ErrCheckoutPromotionAmountChanged`             | `10702026` |                                                        |
| `ErrCheckoutFreeGiftConditionMetButNotSelected` | `10702027` |                                                        |
| `ErrCheckoutGiftInvalid`                        | `10702028` |                                                        |
| `ErrCheckoutItemIsActive`                       | `10702030` |                                                        |
| `ErrCheckoutMultipleItemsIsActive`              | `10702032` |                                                        |
| `ErrCheckoutLoginRequiredForCoupons`            | `10702034` |                                                        |
| `ErrCheckoutZipCodeNotInDeliveryArea`           | `10702036` | 代码中实际用的是 Cart 版 `ErrZipCodeNotInDeliveryArea` |
| `ErrCheckoutProductNotAvailableInZipCode`       | `10702037` |                                                        |
| `ErrCheckoutAddressIsDeleted`                   | `10702038` | 代码中实际用的是 Cart 版 `ErrAddressIsDeleted`         |
| `ErrCheckoutMergeFailed`                        | `10702039` |                                                        |
| `ErrCheckoutTransferFailed`                     | `10702040` |                                                        |

**Checkout 段保留成员**：`ErrCheckoutDeletedItem`、`ErrCheckoutTerminalNotForSale`、`ErrCheckoutItemNotEnabled`、`ErrCheckoutLatestSalePriceNotEqualToCartPrice`、`ErrCheckoutSwatchMoreThanThree`、`ErrCheckoutMoreThanMaxSaleQty`、`ErrCheckoutLessThanMinSaleQty`、`ErrCheckoutUnequalQtyIncrements`、`ErrCheckoutItemOutOfStock`、`ErrCheckoutMultipleItemsDeletedItem`、`ErrCheckoutMultipleItemsNotEnabled`、`ErrCheckoutMultipleItemsTerminalNotForSale`、`ErrCheckoutMultipleItemsLatestSalePriceNotEqualToCartPrice`、`ErrCheckoutMultipleItemsMoreThanMaxSaleQty`、`ErrCheckoutMultipleItemsLessThanMinSaleQty`、`ErrCheckoutMultipleItemsUnequalQtyIncrements`、`ErrCheckoutMultipleItemsOutOfStock`、`ErrCheckoutSingleSwatchMoreThanTwo`、`ErrCheckoutSwatchOneOrderInThePastTwoWeeks`、`ErrCheckoutCouponInvalid`、`ErrCheckoutCustomizedItem`、`ErrCheckoutMultipleItemsCustomizedItem`、`ErrCheckoutNotLogin`、`ErrCheckoutCheckoutTokenExpired`、`ErrCheckoutCacheExpiration`

---

### 5. TransactionApiErrorCode — Order/IMS 段 未使用成员

| 成员                                | 值         |
| ----------------------------------- | ---------- |
| `ErrOrderCannotUpdate`              | `10703001` |
| `ErrOrderNotPosOrder`               | `10703002` |
| `ErrOrderStatusNotPendingPayment`   | `10703003` |
| `ErrPaymentTotalLessThanOrderTotal` | `10703004` |
| `ErrOrderAlreadyCompleted`          | `10703005` |
| `ErrPaymentCurrencyMismatch`        | `10703006` |
| `ErrPaymentAmountExceedsRemaining`  | `10703007` |
| `ErrOrderIMSGiftSkuNotFound`        | `10703008` |
| `ErrOrderIMSGiftExists`             | `10703009` |
| `ErrOrderIMSGiftPromotionNotFound`  | `10703010` |
| `ErrOrderIMSNotFound`               | `10703011` |
| `ErrOrderIMSSkuNotSupported`        | `10703014` |
| `ErrOrderIMSReservationNotFound`    | `10703015` |
| `ErrOrderIMSParamValidationFailed`  | `10703016` |
| `ErrOrderIMSRepeatedReserve`        | `10703017` |
| `ErrOrderIMSReservationHasBeenDone` | `10703019` |
| `ErrOrderIMSSystemBusy`             | `10703020` |
| `ErrOrderUserBlacklisted`           | `10703022` |
| `ErrOrderTotalIsLessThanZero`       | `10703025` |
| `ErrExchangeOrderNotFound`          | `10703026` |
| `ErrSPLOrderStatusCheckFailed`      | `10703027` |
| `ErrSPLOrderInventoryReserveFailed` | `10703028` |
| `ErrOrderPriceChanged`              | `10703029` |

**Order 段保留成员**：`ErrOrderIMSNotEnoughInventory`（10703012）、`ErrOrderIMSExpectedLeadTimeChanged`（10703018）、`ErrOrderPromotionIsChanged`（10703021）、`ErrOrderAlreadyCanceled`（10703023）、`ErrOrderExpired`（10703024）

---

### 6. TransactionApiErrorCode — Payment 分类段 (⚠️ 待确认是否移除)

> 这批 codes 是 payment 重构阶段新加入的，对应 `classify-payment-error.ts` 中各 error category 的后端语义映射。目前前端**未通过 enum 名直接引用**，实际分类逻辑使用 Stripe/2C2P 的 decline code 字符串。
>
> **建议保留**，作为后端协议同步文档；如确认无后续计划接入，可一并移除。

| 成员                                      | 值         |
| ----------------------------------------- | ---------- |
| `ErrPaymentFailedGeneric`                 | `10703030` |
| `ErrStripeHttp4xx`                        | `10703031` |
| `ErrStripeHttp5xx`                        | `10703032` |
| `ErrPaymentApiIntegration`                | `10703033` |
| `ErrPaymentUserAuthorizationIssue`        | `10703034` |
| `ErrPaymentAccountSetupIssue`             | `10703035` |
| `ErrPaymentAuthorizationCardIssue`        | `10703036` |
| `ErrPaymentInvalidOrMissingParameters`    | `10703037` |
| `ErrPaymentAmountIssue`                   | `10703038` |
| `ErrPaymentSecurityComplianceRestriction` | `10703039` |
| `ErrPaymentBankAccountIssue`              | `10703040` |
| `ErrPaymentChargeIssue`                   | `10703041` |
| `ErrPaymentProcessingFailure`             | `10703042` |
| `ErrPaymentSubscriptionInvoiceError`      | `10703043` |
| `ErrPaymentGeographicCurrencyRestriction` | `10703044` |
| `ErrPaymentDeprecatedMethodVersion`       | `10703045` |
| `ErrPayPalShortError`                     | `10703046` |
| `ErrPaymentProcessingTimeout`             | `10703047` |
| `ErrPaymentSuccessButOrderCanceled`       | `10703048` |

---

### 7. OrderAdminErrorCode（整个 enum）

整个 enum 未被任何前端文件引用，可整体移除。

| 成员                                      | 值         |
| ----------------------------------------- | ---------- |
| `OrderAdminErrorCodeOK`                   | `0`        |
| `ErrorOrderNotFound`                      | `10902001` |
| `ErrorOrderAlreadyCancelled`              | `10902002` |
| `ErrorOrderStatusNotAllowCancel`          | `10902003` |
| `ErrorYotpoOrderNotFound`                 | `10902004` |
| `ErrorLineItemsIsRequired`                | `10902020` |
| `ErrorLineItemNotInTheOrder`              | `10902021` |
| `ErrorWarrantyOrderNotFound`              | `10902022` |
| `ErrorLineItemMissingWarrantyHash`        | `10902023` |
| `ErrorLineItemWarrantyHashNotFound`       | `10902024` |
| `ErrorOrderConfirmationEmailDataNotFound` | `10902040` |

---

## 涉及文件

- 修改文件：`libs/config/src/ec-error-codes.ts`
- 无需修改消费方文件（移除的均为未引用成员）

## 执行前检查

- [ ] 确认 `ErrPayment*`（10703030–10703048）段是否一并移除
- [ ] 确认没有通过数字字面量（如 `10701003`）直接引用待移除 codes 的场景
- [ ] 执行移除后验证 TypeScript 编译无报错
