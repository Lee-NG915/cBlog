/**
 * PosCreateOrderResponse
 * Pos Create Order Response
 */
import type { OrderPaymentV1, PaymentStatusSchema } from './payment-api.entity';
import type { PromotionDetailSchema } from './cart.entity';
export interface PosCreateOrderResponse {
  code: number;
  msg: string;
  data: PosCreateOrderResponseData;
}
interface PosCreateOrderResponseData {
  /**
   * order number
   */
  number?: string;
  /**
   * order ID
   */
  orderId?: string;
  /**
   * order reference number
   */
  referenceNumber?: string;
  /**
   * order status
   */
  status?: string;
  /**
   * order payment expired time
   */
  paymentExpiredAt?: string;
  /**
   * order created time
   */
  createdAt?: string;
  /**
   * order updated time
   */
}

export interface OrderHistoryV1Response {
  code: number;
  msg: string;
  data: OrderV1ListData;
}
export interface OrderV1DetailsResponse {
  code: number;
  msg: string;
  data: OrderDataV1;
}

export interface OrderV1ListData {
  total: number;
  list: OrderDataV1[];
}

export type OrderChannelV1 = 'web' | 'pos' | string;

export type OrderStatusV1 =
  | 'PENDING_PAYMENT'
  | 'PENDING_FULFILLMENT'
  | 'PARTIALLY_FULFILLED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED';

/**
 * GetOrderResp
 */
export interface OrderDataV1 {
  /**
   * 换货订单号
   */
  exchangeOrderNumber?: string;
  /**
   * 自定义 current page，用来处理倒计时结束后的刷新请求
   */
  currentPage?: number;
  /**
   * assembly preferences
   */
  assemblyPreferences?: string;
  billAddress?: AddressV1;
  /**
   * order channel
   */
  channel?: OrderChannelV1;
  count?: number;
  /**
   * order created time, PlacedAt == CreatedAt
   */
  createdAt?: string;
  /**
   * order id
   */
  id: string;
  /**
   * order note
   */
  note?: string;
  /**
   * order number
   */
  number: string;
  /**
   * payment info list
   */
  payments: OrderPaymentV1[];
  /**
   * Order creation
   * time
   * order placed time, PlacedAt == CreatedAt
   */
  placedAt?: string;
  /**
   * order reference number  ns
   */
  referenceNumber?: string;
  paymentExpiredAt?: string;
  shipAddress?: AddressV1;
  /**
   * shipment info list
   */
  shipments: OrderShipmentV1[];
  /**
   * retail store
   * slug
   * order linteitem count
   */
  slug?: string;
  /**
   * order status
   */
  status?: OrderStatusV1;
  /**
   * 订单状态展示
   */
  displayStatus: string;
  summary: SummaryV1;
  updatedAt?: string;
  // pos service line item
  addOnServiceLineItems?: AddOnServiceLineItemV1[];
  paymentStatus: PaymentStatusSchema;
  firstPurchase: boolean;
  salesName: string;
}
/**
 * AddOnServiceLineItem
 */
export interface AddOnServiceLineItemV1 {
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 币种
   */
  currency: string;
  /**
   * 配送方式
   */
  fulfillmentMethod: number;
  /**
   * 配送仓库
   */
  fulfillmentWarehouse: number;
  /**
   * 服务的line item id
   */
  id: string;
  /**
   * 是否激活(渠道不可用/商品状态非enable)
   */
  isActive: boolean;
  /**
   * 手动优惠总额
   */
  manualDiscountTotal: string;
  /**
   * 产品名称
   */
  productName: string;
  /**
   * 产品类型,如 bundle, configurable, pos service
   */
  productType: string;
  /**
   * 数量
   */
  quantity: number;
  /**
   * 销售价格
   */
  salePrice: string;
  /**
   * 总价
   */
  displayPrice: string;
  variant: VariantV1;
  /**
   * 仓库名称
   */
  warehouseName: string;
}
/**
 * Address V1
 */
export interface AddressV1 {
  address1: string;
  address2: string;
  alternativePhone: string;
  /**
   * 自动选中(only one address)
   */
  autoSelected?: boolean;
  buildingName: string;
  buildingType: string;
  city: string;
  company: string;
  country: string;
  /**
   * 是否可配送
   */
  deliveryEligible: boolean;
  firstname: string;
  flat: string;
  id: number;
  lastname: string;
  level: string;
  phone: string;
  stateName: string;
  street: string;
  streetName: string;
  zipcode: string;
}

/**
 * PaymentSource V1
 */
export interface PaymentSourceV1 {
  /**
   * 卡品牌：visa, mastercard, amex, discover, jcb, diners, unionpay
   */
  cardBrand?: string;
  /**
   * card expiration month
   */
  cardExpMonth?: number;
  /**
   * card expiration year
   */
  cardExpYear?: number;
  /**
   * card last 4 digits
   */
  cardLast4?: string;
  /**
   * payment source id
   */
  id: string;
}

/**
 * OrderShipment V1
 */
export interface OrderShipmentV1 {
  carrierCode: string;
  /**
   * 1-delivery，2-cash&carry
   */
  fulfillmentType: number;
  /**
   * 1-showroom，2-warehouse ,3-showroom display
   */
  fulfillmentWarehouse: number;
  hasUnreviewedItems: boolean;
  lineItems: OrderLineItemV1[];
  number: string;
  preferredDeliveryEndDate: string;
  preferredDeliveryStartDate: string;
  promisedDeliveryEndDate: string;
  promisedDeliveryStartDate: string;
  service: ShipmentServiceDetailV1[];
  shippingFee: string;
  status: 'NEW' | 'DISPATCHED' | 'DELIVERED' | 'CLOSED' | 'CANCELLED';
  trackingLink: string[];
  /**
   * shipment lineitem list
   */
  trackingNumber: string[];
  /**
   * waive service fee
   */
  waiveServiceFee: boolean;
}

/**
 * OrderLineItem V1
 */
export interface OrderLineItemV1 {
  /**
   * product SPU name
   */
  productName: string;
  /**
   * display price
   */
  displayPrice: string;
  /**
   * amount: price * quantity
   */
  amount: string;
  /**
   * 捆绑商品信息
   */
  bundleLineItems: BundleLineItemV1[];
  /**
   * add to cart price
   */
  cartSalePrice: string;
  createdAt: string;
  /**
   * currency, like USD
   */
  currency: string;
  /**
   * lineitem id
   */
  id: number;
  /**
   * images
   */
  images: ImageV1[];
  /**
   * whether the item is customized
   */
  isCustomized: boolean;
  /**
   * is gift
   */
  isGift: boolean;
  /**
   * product name
   */
  listName: string;
  /**
   * manual discount total
   */
  manualDiscountTotal: string;
  /**
   * onepiece product page url
   */
  onepieceProductPageUrl: string;
  /**
   * original Price
   */
  originalPrice: string;
  /**
   * product slug
   */
  productSlug: string;
  /**
   * product type
   * bundle, configurable, pos service
   */
  productType: string;
  /**
   * quantity
   */
  quantity: number;
  /**
   * sale Price
   */
  salePrice: string;
  /**
   * sku
   */
  sku: string;
  /**
   * tags
   */
  tags: TagV1[];
  updatedAt: string;
  /**
   * variant id
   */
  variantId: number;
  /**
   * variant option values
   */
  variantOptionValues: VariantOptionValuesV1[];
  warrantyItem: WarrantyItemV1;
}

/**
 * BundleLineItem V1
 */
export interface BundleLineItemV1 {
  bundleOption: BundleOptionV1;
  /**
   * 数量
   */
  quantity: number;
  variant: VariantV1;
}

/**
 * BundleOption V1
 */
export interface BundleOptionV1 {
  /**
   * 基础价格值ID
   */
  basePriceValueId: number;
  /**
   * 捆绑选项类型
   */
  bundleOptionType: string;
  /**
   * 捆绑选项值
   */
  bundleOptionValues: BundleOptionValueV1[];
  /**
   * 默认数量
   */
  defaultQuantity: number;
  /**
   * 是否前端可见
   */
  frontendViewable: boolean;
  /**
   * 捆绑选项ID
   */
  id: number;
  /**
   * 选项名称
   */
  name: string;
  /**
   * 选项产品ID
   */
  optionProductId: number;
  /**
   * 位置
   */
  position: number;
  /**
   * 产品展示
   */
  presentation: string;
  /**
   * 产品ID
   */
  productId: number;
}

/**
 * BundleOptionValue V1
 */
export interface BundleOptionValueV1 {
  /**
   * 捆绑选项ID
   */
  bundleOptionId: number;
  /**
   * 捆绑选项值ID
   */
  id: number;
  /**
   * Variant 名称
   */
  name: string;
  /**
   * Variant SKU
   */
  sku: string;
  /**
   * Variant 状态
   */
  status: string;
  /**
   * Variant ID
   */
  variantId: number;
}

/**
 * Variant V1
 */
export interface VariantV1 {
  /**
   * 可用渠道
   */
  availableChannels: string[];
  category: CategoryV1[];
  /**
   * 可计费重量
   */
  chargeableWeight: string;
  /**
   * 变体ID
   */
  id: number;
  /**
   * 图片
   */
  images: ImageV1[];
  /**
   * 是否定制
   */
  isCustomized: boolean;
  /**
   * 交货时间
   */
  leadTime: number;
  /**
   * 列表价格
   */
  listPrice: string;
  /**
   * 最大销售数量
   */
  maxSaleQty: number;
  /**
   * 最小销售数量
   */
  minSaleQty: number;
  /**
   * 变体名称
   */
  name: string;
  /**
   * 销售价格
   */
  price: string;
  /**
   * 产品ID
   */
  productId: number;
  /**
   * 产品名称
   */
  productName: string;
  /**
   * 产品slug
   */
  productSlug: string;
  /**
   * 产品分类
   */
  productTaxons: ProductTaxonV1[];
  /**
   * Disable promotions for the product.
   */
  promotionable: boolean;
  /**
   * 数量增量
   */
  qtyIncrements: number;
  /**
   * 尺寸类型
   */
  sizeType: string;
  /**
   * SKU
   */
  sku: string;
  /**
   * 变体选项值
   */
  variantOptionValues: VariantOptionValuesV1[];
  wgApplicable: boolean;
}

/**
 * Category V1
 */
export interface CategoryV1 {
  id: number;
  name: string;
}

/**
 * Image V1
 */
export interface ImageV1 {
  /**
   * 图片ID
   */
  id: number;
  links: LinkV1;
  /**
   * 图片位置
   */
  position: number;
  /**
   * 图片类型
   */
  type: string;
}

/**
 * Link V1
 */
export interface LinkV1 {
  /**
   * Feed图
   */
  feed: string;
  /**
   * 大图
   */
  large: string;
  /**
   * 灰色大图
   */
  largeGray: string;
  /**
   * 大图2倍
   */
  largeX2: string;
  /**
   * 灰色大图2倍
   */
  largeX2Gray: string;
  /**
   * 中图
   */
  medium: string;
  /**
   * 灰色中图
   */
  mediumGray: string;
  /**
   * 中图2倍
   */
  mediumX2: string;
  /**
   * 灰色中图2倍
   */
  mediumX2Gray: string;
  /**
   * 小图
   */
  mini: string;
  /**
   * 灰色小图
   */
  miniGray: string;
  /**
   * 小图2倍
   */
  miniX2: string;
  /**
   * 灰色小图2倍
   */
  miniX2Gray: string;
  /**
   * 公开图
   */
  public: string;
  /**
   * 小图
   */
  small: string;
  /**
   * 灰色小图
   */
  smallGray: string;
  /**
   * 小图2倍
   */
  smallX2: string;
  /**
   * 灰色小图2倍
   */
  smallX2Gray: string;
}

/**
 * ProductTaxon V1
 */
export interface ProductTaxonV1 {
  ancestors: string[];
  id: number;
  level: number;
  name: string;
  permalink: string;
  position: number;
  value: string;
}

/**
 * VariantOptionValues V1
 */
export interface VariantOptionValuesV1 {
  name: string;
  optionTypeName: string;
  optionTypePresentation: string;
  presentation: string;
}

/**
 * Tag V1
 */
export interface TagV1 {
  /**
   * tag description
   */
  description: string;
  /**
   * tag name
   */
  name: string;
}

/**
 * WarrantyItem V1
 */
export interface WarrantyItemV1 {
  /**
   * 保修月数
   */
  durationMonths: string;
  /**
   * 保修折扣
   */
  warrantyDiscount: string;
  /**
   * 保修成本
   */
  warrantyOfferCost: string;
  /**
   * 保修ID
   */
  warrantyOfferId: string;
  /**
   * 保修价格
   */
  warrantyOfferPrice: string;
  /**
   * 保险状态
   */
  warrantyStatus: string;
}

/**
 * ShipmentServiceDetail V1
 */
export interface ShipmentServiceDetailV1 {
  carryUp?: CarryUpServiceDetailV1;
  /**
   * currency
   */
  currency: string;
  /**
   * service description
   */
  description: string;
  /**
   * disposal service products
   */
  disposalProducts: DisposalServiceDetailV1[];
  /**
   * service name
   */
  name: string;
  /**
   * original unit price
   */
  originalUnitPrice: string;
  /**
   * selling unit price
   */
  sellingUnitPrice: string;
  /**
   * service id
   */
  serviceId: number;
  /**
   * service type
   */
  serviceType: string;
  /**
   * tax amount
   */
  taxAmount: string;
  /**
   * total amount
   */
  totalAmount: string;
}

/**
 * CarryUpServiceDetail
 */
export interface CarryUpServiceDetailV1 {
  /**
   * number of items
   */
  numberOfItems: number;
  /**
   * number of stories
   */
  numberOfStories: number;
  [property: string]: any;
}

/**
 * DisposalServiceDetail
 */
export interface DisposalServiceDetailV1 {
  /**
   * disposal type
   */
  disposalType: string;
  /**
   * product id
   */
  productId: string;
  /**
   * product name
   */
  productName: string;
  /**
   * disposal service variant details
   */
  variants: DisposalServiceVariantDetailV1[];
  [property: string]: any;
}
/**
 * DisposalServiceVariantDetail
 */
export interface DisposalServiceVariantDetailV1 {
  /**
   * disposal type
   */
  disposalType: string;
  /**
   * line tax
   */
  lineTax: string;
  /**
   * original unit price
   */
  originalUnitPrice: string;
  /**
   * quantity
   */
  quantity: number;
  /**
   * selling unit price
   */
  sellingUnitPrice: string;
  /**
   * size
   */
  size: string;
  /**
   * sku
   */
  sku: string;
  /**
   * variant id
   */
  variantId: string;
  /**
   * variant name
   */
  variantName: string;
}

/**
 * Summary V1
 */
export interface SummaryV1 {
  /**
   * 是否使用原价计算优惠
   */
  applyWithOriginalPrice: boolean;
  coupon: CouponAmountV1;
  /**
   * 可用优惠券列表
   */
  couponList: CouponV1[];
  /**
   * 币种，如USD
   */
  currency: string;
  /**
   * 礼品池信息
   */
  giftPools: GiftPoolV1[];
  itemTotal: ItemsSubtotalV1;
  /**
   * 优惠信息
   */
  promotionDetails: PromotionDetailSchema;
  /**
   * 优惠总和
   */
  promoTotal: string;
  serviceAmount: ServiceAmountV1;
  shippingFee: ShippingFeeV1;
  tax: TaxV1;
  /**
   * 所有商品、服务、运费，优惠的总价
   */
  total: string;
  warrantyTotal: WarrantyTotalV1;
}

/**
 * CouponAmount V1
 */
export interface CouponAmountV1 {
  /**
   * 优惠金额
   */
  amount: string;
  /**
   * 优惠券码
   */
  code: string;
  /**
   * 优惠券描述
   */
  couponDesc: string;
  /**
   * 优惠券无效原因
   */
  invalidReason: string;
  /**
   * 是否为自动应用
   */
  isAutoApply?: boolean;
  /**
   * 优惠券是否有效
   */
  isValid: boolean;
}

/**
 * Coupon V1
 */
export interface CouponV1 {
  code: string;
  content: VoucherContentV1;
  name: string;
  /**
   * 0: available, 1: unavailable, 2: expired, 3: used
   */
  state: number;
  version: string;
  voucherTime: VoucherTimeV1;
  voucherType: string;
}

/**
 * VoucherContent V1
 */
export interface VoucherContentV1 {
  discountDescription: string;
  unavailableReason: string;
  /**
   * 升级描述
   */
  upgradeDescription: string;
  usingRuleDescription: string;
  /**
   * 使用规则详情
   */
  usingRuleDetail: string;
}

/**
 * VoucherTime V1
 */
export interface VoucherTimeV1 {
  endTime: string;
  startTime: string;
}

/**
 * GiftPool V1
 */
export interface GiftPoolV1 {
  /**
   * action id
   */
  actionId: string;
  /**
   * PromotionControlTypeUnknown = 0 ,PromotionControlTypeCampaign
   * =1,PromotionControlTypeCoupon = 2
   */
  controlType: number;
  /**
   * free gift id
   */
  freeGiftId: string;
  /**
   * gift items
   */
  gifts: GiftItemV1[];
  /**
   * is eligible
   */
  isEligible: boolean;
  minSpend: MinSpendV1;
  /**
   * promotion name
   */
  name: string;
  /**
   * promotion id
   */
  promotionId: string;
  /**
   * unavailable reason
   */
  unavailableReason: string;
}

/**
 * GiftItem V1
 */
export interface GiftItemV1 {
  /**
   * gift pool id
   */
  freeGiftId?: string;
  /**
   * quantity
   */
  quantity: number;
  /**
   * selected
   */
  selected: boolean;
  /**
   * stock
   */
  state?: boolean;
  /**
   * variant info
   */
  variantId: number;
}

/**
 * MinSpend V1
 */
export interface MinSpendV1 {
  /**
   * 最小消费金额
   */
  amount: string;
  currency: string;
  /**
   * 消费类型
   */
  purchaseType: number;
  /**
   * 最小数量
   */
  quantity: number;
}

/**
 * ItemsSubtotal V1
 */
export interface ItemsSubtotalV1 {
  /**
   * actual subtotal
   */
  actualSubtotal: string;
  /**
   * original subtotal
   */
  originalSubtotal: string;
}

/**
 * Promotion V1
 */
export interface PromotionV1 {
  /**
   * 促销动作ID
   */
  actionId: number;
  /**
   * 促销动作类型,如 discount, gift
   */
  actionType: string;
  /**
   * discount
   */
  discount?: string;
  /**
   * 促销描述
   */
  promotionDesc?: string;
  /**
   * 促销ID
   */
  promotionID: number;
  /**
   * 促销名称
   */
  promotionName?: string;
  totalDiscount?: string;
}

/**
 * ServiceAmount V1
 */
export interface ServiceAmountV1 {
  /**
   * actual subtotal
   */
  actualTotal: string;
  /**
   * discount service fee total
   */
  discountTotal: string;
  /**
   * original subtotal
   */
  originalTotal: string;
  /**
   * selling total
   */
  sellingTotal: string;
  typeAmountMap: { [key: string]: TypeAmountMapV1 };
}

export interface TypeAmountMapV1 {
  /**
   * service name
   */
  name: string;
  /**
   * the total amount of all service fees
   */
  actualTotal: string;
  /**
   * the total amount of all service fees
   */
  originalTotal: string;
  [property: string]: any;
}

/**
 * ShippingFee V1
 */
export interface ShippingFeeV1 {
  /**
   * shipping fee total
   */
  actualTotal: string;
  /**
   * discount shipping fee total
   */
  discountTotal: string;
  /**
   * selling total
   */
  sellingTotal: string;
  /**
   * original shipping fee total
   */
  shipmentOriginalTotal: string;
  /**
   * shipment
   */
  shipments: CartShipmentV1[];
}

/**
 * CartShipment V1
 */
export interface CartShipmentV1 {
  /**
   * actual shipping fee
   */
  actualShippingFee: string;
  /**
   * free shipping threshold
   */
  freeShippingThreshold: string;
  /**
   * original shipping fee
   */
  originalShippingFee: string;
  /**
   * shipment id
   */
  shipmentId: string;
}

/**
 * Tax
 */
export interface TaxV1 {
  /**
   * for us,ca
   */
  additionalTaxTotal: string;
  /**
   * for sg,au,uk
   */
  includedTaxTotal: string;
}

/**
 * WarrantyTotal
 */
export interface WarrantyTotalV1 {
  /**
   * actual subtotal
   */
  actualTotal: string;
  /**
   * discount warranty total
   */
  discountTotal: string;
  /**
   * original subtotal
   */
  originalTotal: string;
}
