// Error Code from API
// Please keep the error code consistent with the API.
// Check this file when you are not sure about the error code.

export enum EcErrorCode {
  SUCCESS = 0,
  NOT_FOUND = 40009,
  ZIPCODE_FAILURE = 40011,
  SPECIAL_ZIPCODE_FAILURE = 40016,
}

// Global error code
// https://github.com/castlery/go-ecommerce-common/blob/order_dev/errs/system_err.go
export enum GlobalApiErrorCode {
  // SysErrCode 系统错误
  SysErrCode = 100010001,
  // ServiceUnavailableCode 服务端资源不可用
  ServiceUnavailableCode = 100010002,
  // RemoteServiceErrCode 远程服务出错
  RemoteServiceErrCode = 100010003,
  // PermissionDeniedCode 权限限制
  PermissionDeniedCode = 100010004,
  // InvalidParamCode 参数错误
  InvalidParamCode = 100010005,
  // TooManyRequestsCode 任务过多，系统繁忙
  TooManyRequestsCode = 100010006,
  // RequestTimeoutCode 接口请求/任务超时
  RequestTimeoutCode = 100010007,
  // InvalidRequestCode 非法请求
  InvalidRequestCode = 100010008,
  // NotFoundCode 接口不存在
  NotFoundCode = 100010009,
  // MethodNotAllowedCode 请求的HTTP METHOD不支持
  MethodNotAllowedCode = 100010010,
  // DeprecatedCode 该接口已经废弃
  DeprecatedCode = 100010011,
  // IPRequestLimitCode IP请求超过上限
  IPRequestLimitCode = 100010012,
  // UserRequestLimitCode 用户请求超过上限
  UserRequestLimitCode = 100010013,
  // RequestEntityTooLargeCode 请求长度超过限制
  RequestEntityTooLargeCode = 10014,
  HTTPClientClosedRequestCode = 10015,
}

// Order ErrorCode 10502000 - 10502199
// 通用, admin api core都可以使用
export enum OrderErrorCode {
  ErrorOrderNotExist = 10502001, // 订单不存在
}

/**
 * Transaction Api ErrorCode
 * includes Cart,Checkout,Payment,Promotion, etc.
 * @doc BE Order error code defined: https://github.com/castlery/protocol/blob/order_dev/order/core/common.proto
 * @doc FE Cart error msg defined: https://castlery.atlassian.net/wiki/spaces/PM/pages/3017113702/Cart+Transaction+Verification#4%E3%80%81%E5%95%86%E5%93%81%E5%8A%A0%E8%B4%AD%E6%97%B6%E7%9A%84%E6%8B%A6%E6%88%AA%E9%AA%8C%E8%AF%81
 * @doc FE Checkout error msg defined: https://castlery.atlassian.net/wiki/x/IwDOtg
 */
export enum TransactionApiErrorCode {
  //================ Cart Error Codes =====================
  ErrLessThanMinSaleQty = 10701000, // 数量小于最小销售数量
  ErrMoreThanMaxSaleQty = 10701001, // 数量大于最大销售数量
  ErrUnequalQtyIncrements = 10701002, // 数量不等于增量
  ErrSwatchMoreThanThree = 10701003, // 样品总数不超过3个
  ErrSingleSwatchMoreThanTwo = 10701004, // 同一个样品总数不超过1个
  ErrSwatchOneOrderInThePastTwoWeeks = 10701005, // 过去两周内同一样品只能下一次订单
  ErrSummaryCacheNotGenerated = 10701006, //  summary cache not generated
  ErrEmptyLineItems = 10701007, //  当前购物车为空
  ErrQtyRemainderIsNotZero = 10701008, // Quantity not meet the quantity increment requirement
  ErrMultipleItemsLessThanMinSaleQty = 10701009, // 数量小于最小销售数量
  ErrMultipleItemsMoreThanMaxSaleQty = 10701010, // 数量大于最大销售数量
  ErrMultipleItemsUnequalQtyIncrements = 10701011, // 数量不等于增量
  ErrMultipleItemsQtyRemainderIsNotZero = 10701012, // Quantity not meet the quantity increment requirement
  ErrDeletedItem = 10701013, // 商品已删除
  ErrTerminalNotForSale = 10701014, // 终端不可售
  ErrItemNotEnabled = 10701015, // 商品的状态是否为enable
  ErrLatestSalePriceNotEqualToCartPrice = 10701016, // 商品的最新销售价不等于加车销售价
  ErrItemOutOfStock = 10701017, // 商品库存状态 是否无货
  ErrItemLTChanged = 10701018, // 商品LT 是否发生变化
  ErrCouponInvalid = 10701019, // 应用的coupon是否有效
  ErrPromotionAmountChanged = 10701020, // Summary中自动应用的promotion的金额是否有变动
  ErrFreeGiftConditionMetButNotSelected = 10701021, // 是否满足了free gift条件但没有挑选gift
  ErrGiftInvalid = 10701022, // Gift 无效
  ErrCustomizedItem = 10701023, // 商品是否有定制商品
  ErrItemIsActive = 10701024, // is_active 是否为true
  ErrMultipleItemsDeletedItem = 10701025, // 多个商品已删除
  ErrMultipleItemsNotEnabled = 10701026, // 商品的状态是否为enable
  ErrMultipleItemsTerminalNotForSale = 10701027, // 终端不可售
  ErrMultipleItemsOutOfStock = 10701028, // 商品库存状态 是否无货
  ErrMultipleItemsLTChanged = 10701029, // 商品LT 是否发生变化
  ErrMultipleItemsCustomizedItem = 10701030, // 商品是否有定制商品
  ErrMultipleItemsIsActive = 10701031, // is_active 是否为true
  ErrNotLogin = 10701032, // 未登录
  ErrMultipleItemsLatestSalePriceNotEqualToCartPrice = 10701033, // 商品的最新销售价不等于加车销售价
  ErrCartQtyExceedsLimit = 10701034, // 购物车数量不能大于100
  ErrLoginRequiredForCoupons = 10701035, // 购物车数量不能大于100
  ErrCheckoutTokenExpired = 10701036, // checkout token expired
  ErrZipCodeNotInDeliveryArea = 10701037, // zip code not in delivery area
  ErrProductNotAvailableInZipCode = 10701038, // product not available in zip code
  ErrAddressIsDeleted = 10701039, // address is deleted
  ErrMergeFailed = 10701040, // Merge failed
  ErrTransferFailed = 10701041, // transfer failed
  ErrCartCacheExpired = 10701042, // cart cache expired
  ErrLineItemsDeleted = 10701043, // line items deleted, such as cart not found, etc.
  ErrInvalidProduct = 10701044, // line item is deleted
  ErrBatchAddLineItemsAllFailed = 10702045,
  ErrBatchAddLineItemsPartialFailed = 10702046,
  ErrGiftQuantityImmutable = 10702047, // gift quantity cannot be changed
  //================ Checkout Error Codes =====================
  ErrCheckoutDeletedItem = 10702000, // item has been deleted
  ErrCheckoutTerminalNotForSale = 10702001, // terminal is not for sale
  ErrCheckoutItemNotEnabled = 10702002, // item status is not enabled
  ErrCheckoutLatestSalePriceNotEqualToCartPrice = 10702003, // latest sale price is not equal to cart price
  ErrCheckoutSwatchMoreThanThree = 10702004, // total number of swatches exceeds three
  ErrCheckoutMoreThanMaxSaleQty = 10702005, // quantity is greater than maximum sale quantity
  ErrCheckoutLessThanMinSaleQty = 10702006, // quantity is less than minimum sale quantity
  ErrCheckoutUnequalQtyIncrements = 10702007, // quantity does not meet quantity increment requirement
  ErrCheckoutItemOutOfStock = 10702008, // item is out of stock
  ErrCheckoutItemLTChanged = 10702009, // item lead time has changed
  ErrCheckoutMultipleItemsDeletedItem = 10702010, // multiple items have been deleted
  ErrCheckoutMultipleItemsNotEnabled = 10702011, // item status is not enabled for multiple items
  ErrCheckoutMultipleItemsTerminalNotForSale = 10702012, // terminal is not for sale for multiple items
  ErrCheckoutMultipleItemsLatestSalePriceNotEqualToCartPrice = 10702013, // latest sale price is not equal to cart price for multiple items
  ErrCheckoutMultipleItemsMoreThanMaxSaleQty = 10702014, // quantity is greater than maximum sale quantity for multiple items
  ErrCheckoutMultipleItemsLessThanMinSaleQty = 10702015, // quantity is less than minimum sale quantity for multiple items
  ErrCheckoutMultipleItemsUnequalQtyIncrements = 10702016, // quantity does not meet quantity increment requirement for multiple items
  ErrCheckoutMultipleItemsOutOfStock = 10702017, // multiple items are out of stock
  ErrCheckoutMultipleItemsLTChanged = 10702018, // item lead time has changed for multiple items
  ErrCheckoutSingleSwatchMoreThanTwo = 10702019, // single swatch total number does not exceed one
  ErrCheckoutSwatchOneOrderInThePastTwoWeeks = 10702020, // same swatch can only place one order in the past two weeks
  ErrCheckoutSummaryCacheNotGenerated = 10702021, // summary cache not generated
  ErrCheckoutEmptyLineItems = 10702022, // cart is empty
  ErrCheckoutQtyRemainderIsNotZero = 10702023, // Quantity not meet the quantity increment requirement
  ErrCheckoutMultipleItemsQtyRemainderIsNotZero = 10702024, // Quantity not meet the quantity increment requirement
  ErrCheckoutCouponInvalid = 10702025, // applied coupon is invalid
  ErrCheckoutPromotionAmountChanged = 10702026, // automatically applied promotion amount in summary has changed
  ErrCheckoutFreeGiftConditionMetButNotSelected = 10702027, // free gift condition is met but gift is not selected
  ErrCheckoutGiftInvalid = 10702028, // gift is invalid
  ErrCheckoutCustomizedItem = 10702029, // item has customized item
  ErrCheckoutItemIsActive = 10702030, // is_active is not true
  ErrCheckoutMultipleItemsCustomizedItem = 10702031, // items have customized item
  ErrCheckoutMultipleItemsIsActive = 10702032, // is_active is not true
  ErrCheckoutNotLogin = 10702033, // not logged in
  ErrCheckoutLoginRequiredForCoupons = 10702034, // login required for coupons
  ErrCheckoutCheckoutTokenExpired = 10702035, // checkout token expired
  ErrCheckoutZipCodeNotInDeliveryArea = 10702036, // zip code not in delivery area
  ErrCheckoutProductNotAvailableInZipCode = 10702037, // product not available in zip code
  ErrCheckoutAddressIsDeleted = 10702038, // address is deleted
  ErrCheckoutMergeFailed = 10702039, // Merge failed
  ErrCheckoutTransferFailed = 10702040, // transfer failed
  ErrCheckoutCacheExpiration = 10702041, // checkout cache expiration
  ErrCheckoutTokenMissing = 10702042, // checkout token is not set
  ErrCheckoutReturnToCart = 10702043, // On error, redirect back to the cart page during checkout

  // Order Api Error Code
  ErrOrderCannotUpdate = 10703001, // Order cannot be updated in its current status
  ErrOrderNotPosOrder = 10703002, // Order is not a POS order
  ErrOrderStatusNotPendingPayment = 10703003, // Order status is not PENDING_PAYMENT
  ErrPaymentTotalLessThanOrderTotal = 10703004, // Payment total is less than order total
  ErrOrderAlreadyCompleted = 10703005, // Order is already completed, cannot add more payments
  ErrPaymentCurrencyMismatch = 10703006, // Payment currency does not match order currency
  ErrPaymentAmountExceedsRemaining = 10703007, // Payment amount exceeds remaining amount
  ErrOrderIMSGiftSkuNotFound = 10703008, // Gift SKU not found in IMS
  ErrOrderIMSGiftExists = 10703009, // Gift already exists
  ErrOrderIMSGiftPromotionNotFound = 10703010, // Gift promotion not found
  ErrOrderIMSNotFound = 10703011, // Not found
  ErrOrderIMSNotEnoughInventory = 10703012, // Not enough inventory
  ErrOrderIMSSkuNotSupported = 10703014, // SKU not supported
  ErrOrderIMSReservationNotFound = 10703015, // Reservation not found
  ErrOrderIMSParamValidationFailed = 10703016, // Param validation failed
  ErrOrderIMSRepeatedReserve = 10703017, // Repeated reserve
  ErrOrderIMSExpectedLeadTimeChanged = 10703018, // Expected lead time changed
  ErrOrderIMSReservationHasBeenDone = 10703019, // Reservation has been done
  ErrOrderIMSSystemBusy = 10703020, // System busy
  ErrOrderPromotionIsChanged = 10703021, // Order promotion is changed
  ErrOrderUserBlacklisted = 10703022,
  ErrOrderAlreadyCanceled = 10703023,
  ErrOrderExpired = 10703024,
  ErrOrderTotalIsLessThanZero = 10703025, // Order total is less than zero
  ErrExchangeOrderNotFound = 10703026, // Exchange order not found
  ErrSPLOrderStatusCheckFailed = 10703027, // SPL order status check failed
  ErrSPLOrderInventoryReserveFailed = 10703028, // SPL order inventory reserve failed
  ErrOrderPriceChanged = 10703029, // Order price has changed
  ErrPaymentFailedGeneric = 10703030, // Generic payment failed
  ErrStripeHttp4xx = 10703031, // Stripe HTTP 4xx
  ErrStripeHttp5xx = 10703032, // Stripe HTTP 5xx
  ErrPaymentApiIntegration = 10703033, // API & integration errors
  ErrPaymentUserAuthorizationIssue = 10703034, // User action / authorization issues
  ErrPaymentAccountSetupIssue = 10703035, // Account setup & verification issues
  ErrPaymentAuthorizationCardIssue = 10703036, // Authorization & card issues
  ErrPaymentInvalidOrMissingParameters = 10703037, // Invalid or missing parameters
  ErrPaymentAmountIssue = 10703038, // Amount issue
  ErrPaymentSecurityComplianceRestriction = 10703039, // Security / compliance restrictions
  ErrPaymentBankAccountIssue = 10703040, // Bank account & payout issues
  ErrPaymentChargeIssue = 10703041, // Charge issue
  ErrPaymentProcessingFailure = 10703042, // Payment processing failures
  ErrPaymentSubscriptionInvoiceError = 10703043, // Subscription & invoice errors
  ErrPaymentGeographicCurrencyRestriction = 10703044, // Geographic & currency restrictions
  ErrPaymentDeprecatedMethodVersion = 10703045, // Deprecated methods & versioning
  ErrPayPalShortError = 10703046, // PayPal short error + retry suffix
  ErrPaymentProcessingTimeout = 10703047, // Payment is processing / FE timeout
  ErrPaymentSuccessButOrderCanceled = 10703048, // Payment succeeded but order was canceled during payment process
  ErrOrderWarrantyInvalid = 10703050, // Order warranty is invalid
}

// OrderAdminErrorCode 10902000～10902999
export enum OrderAdminErrorCode {
  // cancelOrder
  OrderAdminErrorCodeOK = 0,
  ErrorOrderNotFound = 10902001, // 订单不存在
  ErrorOrderAlreadyCancelled = 10902002, // 订单已取消
  ErrorOrderStatusNotAllowCancel = 10902003, // 订单状态不允许取消
  ErrorYotpoOrderNotFound = 10902004, // yotpo 订单不存在
  // cancelOrderWarranties
  ErrorLineItemsIsRequired = 10902020, // line_items is required
  ErrorLineItemNotInTheOrder = 10902021, // line item not in the order
  ErrorWarrantyOrderNotFound = 10902022, // line item warranty not found
  ErrorLineItemMissingWarrantyHash = 10902023, // line item missing warranty hash
  ErrorLineItemWarrantyHashNotFound = 10902024, // line item warranty hash not found
  // getOrderConfirmationEmailData
  ErrorOrderConfirmationEmailDataNotFound = 10902040, // order confirmation email data not found
}
