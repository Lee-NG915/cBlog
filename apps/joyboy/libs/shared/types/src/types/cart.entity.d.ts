import { ProductTypeMapping } from '@castlery/config';
import { GiftVariantDetailSchema } from './gift.entity';

export enum AdjustmentType_V2 {
  fixed_amount = 'fixed_amount',
  percentage = 'percentage',
}
export interface CartItemsRoot_V2 {
  count: number;
  zipcode: Zipcode_V2;
  lineItems: LineItem_V2[];
  addOnServiceLineItems: AddOnServiceLineItem_V2[] | null;
  gift: Gift_V2[] | null;
  summaryId: string;
}

export interface Zipcode_V2 {
  zipcode: string;
  countryState: string;
  city: string;
}

export interface LineItem_V2 {
  id: string;
  productType: ProductTypeMapping;
  quantity: number;
  currency: string;
  salePrice: string;
  cartSalePrice: string;
  originalPrice: string;
  discountPrice: string;
  priceExclTax: string;
  manualDiscountTotal: string;
  total: string;
  originalTotal: string;
  isGift: boolean;
  giftPoolId: string;
  isPriceOutdated: boolean;
  isRegionOutdated: boolean;
  preferredSelfCollection: boolean;
  preferredStockLocationId: number;
  isActive: boolean;
  isDeleted: boolean;
  stockStatus: string;
  visitedInOffline: boolean;
  onepieceProductPageUrl: string;
  variant: Variant_V2;
  deliveryLeadTimePresentation: string;
  warehouseName: string;
  warrantyItem: WarrantyItem_V2 | null;
  bundleLineItems: BundleLineItem_V2[] | null;
  llt: boolean;
  status: string; //"enabled"
}

export interface Variant_V2 {
  id: number;
  name: string;
  sku: string;
  currency: string;
  price: string;
  listPrice: string;
  maxSaleQty: number;
  assemblyType: string;
  productId: number;
  productSlug: string;
  minSaleQty: number;
  qtyIncrements: number;
  productName: string;
  isCustomized: boolean;
  leadTime: number;
  availableChannels: string[];
  images: VariantImage_V2[];
  variantOptionValues: VariantOptionValue_V2[];
  productTaxons: ProductTaxon_V2[];
}

export interface ProductTaxon_V2 {
  id: number;
  name: string;
  permalink: string;
  position: number;
  level: number;
  value: string;
  ancestors: string[];
}

export interface VariantImage_V2 {
  links: Links_V2;
}

export interface Links_V2 {
  mini: string;
  medium: string;
}

export interface VariantOptionValue_V2 {
  name: string;
  presentation: string;
  optionTypeName: string;
  optionTypePresentation: string;
}

export interface WarrantyItem_V2 {
  durationMonths: string;
  warrantyOfferId: string;
  warrantyDiscount: string;
  warrantyOfferPrice: string;
}

export interface BundleLineItem_V2 {
  quantity: number;
  variant: BundleVariant_V2;
  bundleOption: BundleOption_V2;
}

export interface BundleOption_V2 {
  id: number;
  bundleOptionType: string;
}

export interface BundleVariant_V2 {
  id: number;
  name: string;
  sku: string;
  currency: string;
  price: string;
  listPrice: string;
  maxSaleQty: number;
  assemblyType: string;
  productId: number;
  productSlug: string;
  minSaleQty: number;
  qtyIncrements: number;
  productName: string;
  isCustomized: boolean;
  leadTime: number;
  availableChannels: string[];
  images: Image2_V2[];
  variantOptionValues: BundleVariantOptionValue_V2[];
  productTaxons: ProductTaxon_V2[];
}

export interface Image2_V2 {
  links: Links2_V2;
}

export interface Links2_V2 {
  mini: string;
}

export interface BundleVariantOptionValue_V2 {
  name: string;
  presentation: string;
  optionTypeName: string;
  optionTypePresentation: string;
}

export interface AddOnServiceLineItem_V2 {
  id: string; // service item id
  quantity: number;
  salePrice: string;
  currency: string;
  total: string;
  productType: ProductTypeMapping;
  variant: AddOnServiceLineItemVariant_V2;
  productName: string;
  manualDiscountTotal: string;
  isActive: boolean; // 是否激活(渠道不可用/商品状态非enable)
}

export interface AddOnServiceLineItemVariant_V2 {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: string;
  availableChannels: string[];
  chargeableWeight: string; //可计费重量
  images: {
    id: number;
    links: Links_V2;
    position: number;
    type: string;
  }[];
  isCustomized: boolean;
  leadTime: number;
  listPrice: string;
  maxSaleQty: number;
  minSaleQty: number;
  qtyIncrements: number;
  productId: number;
  productSlug: string;
  productName: string;
  productTaxons: ProductTaxon_V2[];
  sizeType: string;

  variantOptionValues: VariantOptionValue_V2[];
}

export interface Gift_V2 {
  isEligible: boolean;
  unavailableReason: string;
  quantity: number;
  state: string;
  variant: Variant_V2;
  giftPoolId: string;
}
export interface Image3_V2 {
  links: Links3_V2;
}

export interface Links3_V2 {
  mini: string;
}

export interface CartDataSchema {
  /**
   * 购物车附加服务信息
   */
  addOnServiceLineItems?: AddOnServiceLineItemSchema[];
  /**
   * 购物车商品数量
   */
  count?: number;
  /**
   * 购物车礼品信息
   */
  gifts?: GiftLineItemSchema[];
  /**
   * 购物车商品信息
   */
  lineItems?: LineItemSchema[];
  /**
   * 购物车各类价格汇总
   */
  summary?: SummarySchema;
  /**
   * 购物车商Zipcode 信息
   */
  zipcode?: ZipcodeSchema;
  [property: string]: any;
}

export interface VariantOptionValueSchema {
  name: string;
  presentation: string;
  optionTypeName: string;
  optionTypePresentation: string;
}

export interface AddOnServiceLineItemSchema {
  /**
   * 创建时间
   */
  createdAt: string;
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
   * 产品类型,如 bundle, configurable
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
  total: string;
  /**
   * 服务的variant信息
   */
  variant: AddOnServiceLineItemVariantSchema;
  /**
   * 仓库名称
   */
  warehouseName: string;
  [property: string]: any;
}

/**
 * 服务的variant信息
 */
export interface AddOnServiceLineItemVariantSchema {
  /**
   * 可用渠道
   */
  availableChannels: string[];
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
  images: { [key: string]: any }[];
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
  productTaxons: { [key: string]: any }[];
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
  variantOptionValues: VariantOptionValueSchema[];
  [property: string]: any;
}

export interface GiftLineItemSchema {
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 配送方式
   */
  fulfillmentMethod: number;
  /**
   * 配送仓库
   */
  fulfillmentWarehouse: number;
  /**
   * 礼品ID
   */
  giftPoolId: string;
  /**
   * line item ID
   */
  id: string;
  /**
   * 是否激活(渠道不可用/商品状态非enable)
   */
  isActive: boolean;
  /**
   * 商品是否已删除
   */
  isDeleted: boolean;
  /**
   * 是否符合条件
   */
  isEligible: boolean;
  /**
   * 价格过期
   */
  isPriceOutdated: boolean;
  /**
   * 无货
   */
  isRegionOutdated: boolean;
  /**
   * Delivery time, the unit is days
   */
  leadTime: number;
  /**
   * 库存状态
   */
  leadTimeInfo: GiftLeadTimeInfoSchema;
  /**
   * 更新交货时间更新
   */
  leadTimeUpdate: boolean;
  /**
   * Long Lead Time
   */
  llt: boolean;
  /**
   * 最低消费
   */
  minSpend: GiftMinSpendSchema;
  /**
   * 商品详情页URL
   */
  onepieceProductPageUrl: string;
  /**
   * 原价
   */
  originalPrice: string;
  /**
   * if PreferredStockLocationID is not 0, then this field is required
   */
  preferredStockLocationCode: string;
  /**
   * 优选库存位置
   */
  preferredStockLocationId: number;
  /**
   * 产品类型,如 bundle, configurable
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
   * Sales ID
   */
  salesID: number;
  /**
   * 状态
   */
  state: string;
  /**
   * 库存状态
   */
  stockStatus: string;
  /**
   * 不符合条件原因
   */
  unavailableReason: string;
  /**
   * 变体信息
   */
  variant: GiftVariantSchema;
  /**
   * 是否离线访问
   */
  visitedInOffline: boolean;
  /**
   * 仓库名称
   */
  warehouseName: string;
  /**
   * 保险信息
   */
  warrantyItem: WarrantyItemSchema;
  /**
   * 关联的 coupon code，非空表示该 gift 来自 coupon gifts，空表示来自 campaign gifts
   */
  coupon?: string;
  [property: string]: any;
}

/**
 * 库存状态
 */
export interface GiftLeadTimeInfoSchema {
  endDeliveryTime: string;
  endDispatchTime: string;
  startDeliveryTime: string;
  startDispatchTime: string;
  state: string;
  [property: string]: any;
}

/**
 * 最低消费
 */
export interface GiftMinSpendSchema {
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
  [property: string]: any;
}

/**
 * 变体信息
 */
export interface GiftVariantSchema {
  /**
   * 可用渠道
   */
  availableChannels: string[];
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
  images: { [key: string]: any }[];
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
  productTaxons: { [key: string]: any }[];
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
  variantOptionValues: VariantOptionValueSchema[];
  [property: string]: any;
}

/**
 * 保险信息
 */
export interface WarrantyItemSchema {
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
  [property: string]: any;
}

export interface LineItemSchema {
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 捆绑商品信息
   */
  bundleLineItems: LineItemBundleLineItemSchema[];
  /**
   * 加入购物车时的销售价格
   */
  cartSalePrice: string;
  /**
   * 币种
   */
  currency: string;
  /**
   * 优惠价格
   */
  discountPrice: string;
  /**
   * 显示价格
   */
  displayPrice: string;
  /**
   * 显示总价
   */
  displayTotal: string;
  /**
   * 配送方式
   */
  fulfillmentMethod: number;
  /**
   * 配送仓库
   */
  fulfillmentWarehouse: number;
  /**
   * 礼品ID
   */
  giftPoolId: string;
  /**
   * line item id
   */
  id: string;
  /**
   * 是否激活(渠道不可用/商品状态非enable)
   */
  isActive: boolean;
  /**
   * 商品是否已删除
   */
  isDeleted: boolean;
  /**
   * 是否是礼品
   */
  isGift: boolean;
  /**
   * 价格过期
   */
  isPriceOutdated: boolean;
  /**
   * 无货
   */
  isRegionOutdated: boolean;
  /**
   * Delivery time, the unit is days
   */
  leadTime: number;
  /**
   * ims lead time info
   */
  leadTimeInfo: LineItemLeadTimeInfoSchema;
  /**
   * Long Lead Time
   */
  llt: boolean;
  /**
   * 手动优惠总额
   */
  manualDiscountTotal: string;
  /**
   * 商品详情页URL
   */
  onepieceProductPageUrl: string;
  /**
   * 原价
   */
  originalPrice: string;
  /**
   * 原价不含税
   */
  originPriceExclTax: string;
  /**
   * 原价总额
   */
  originalTotal: string;
  /**
   * if PreferredStockLocationID is not 0, then this field is required
   */
  preferredStockLocationCode: string;
  /**
   * 优选库存位置
   */
  preferredStockLocationId: number;
  /**
   * 不含税价格
   */
  priceExclTax: string;
  /**
   * 产品类型,如 bundle, configurable
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
   * Sales ID
   */
  salesID: number;
  /**
   * 状态
   */
  status: string;
  /**
   * 库存状态
   */
  stockStatus: string;
  /**
   * 总价
   */
  total: string;
  /**
   * 总价不含税
   */
  totalExclTax: string;
  /**
   * 变体信息
   */
  variant: LineItemVariantSchema;
  /**
   * 是否离线访问
   */
  visitedInOffline: boolean;
  /**
   * 仓库code
   */
  warehouseCode: string;
  /**
   * 仓库名称
   */
  warehouseName: string;
  /**
   * 保险信息
   */
  warrantyItem: WarrantyItemSchema;
  [property: string]: any;
}

export interface LineItemBundleLineItemSchema {
  /**
   * 捆绑选项
   */
  bundleOption: FluffyBundleOptionSchema;
  /**
   * 数量
   */
  quantity: number;
  /**
   * 变体信息
   */
  variant: FluffyVariantSchema;
  [property: string]: any;
}

/**
 * 捆绑选项
 */
export interface FluffyBundleOptionSchema {
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
  bundleOptionValues: { [key: string]: any }[];
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
  [property: string]: any;
}

/**
 * 变体信息
 */
export interface FluffyVariantSchema {
  /**
   * 可用渠道
   */
  availableChannels: string[];
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
  images: { [key: string]: any }[];
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
  productTaxons: { [key: string]: any }[];
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
  variantOptionValues: VariantOptionValueSchema[];
  [property: string]: any;
}

/**
 * ims lead time info
 */
export interface LineItemLeadTimeInfoSchema {
  endDeliveryTime: string;
  endDispatchTime: string;
  startDeliveryTime: string;
  startDispatchTime: string;
  state: string;
  [property: string]: any;
}

/**
 * 变体信息
 */
export interface LineItemVariantSchema {
  /**
   * 可用渠道
   */
  availableChannels: string[];
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
  images: { [key: string]: any }[];
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
  productTaxons: ProductTaxonSchema[];
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
  variantOptionValues: VariantOptionValueSchema[];
  [property: string]: any;
}

export interface ProductTaxonSchema {
  id: number;
  name: string;
  permalink: string;
  position: number;
  level: number;
  value: string;
  ancestors: string[];
}

/**
 * 购物车各类价格汇总
 */
export interface SummarySchema {
  /**
   * 是否应用原价
   */
  applyWithOriginalPrice: boolean;
  /**
   * 已应用优惠券信息
   */
  coupon: CouponSchema;
  /**
   * 可用优惠券列表
   */
  couponList: CouponListSchema[];
  /**
   * 币种，如USD
   */
  currency: string;
  /**
   * 礼品池信息
   */
  giftPools: GiftPoolSchema[];
  /**
   * 商品的价格总和
   */
  itemTotal: ItemTotalSchema;
  /**
   * 优惠信息
   */
  promotionDetails: PromotionDetailSchema;
  /**
   * 服务费总和
   */
  serviceAmount: ServiceAmountSchema;
  /**
   * shippingFee
   */
  shippingFee: ShippingFeeSchema;
  /**
   * 税费总和
   */
  tax: TaxSchema;
  /**
   * 所有商品、服务、运费，优惠的总价
   */
  total: string;
  /**
   * 保修费总和
   */
  warrantyTotal: WarrantyTotalSchema;
  [property: string]: any;
}

export interface PromotionDetailSchema {
  displayPromotionTotal: string;
  promotionInvalidMsg: string;
  promotions: PromotionItemSchema[];
}

export type PromotionActionType =
  | 'ActionTypeUnknown'
  | 'ActionTypeProductDiscount'
  | 'ActionTypeOrderDiscount'
  | 'ActionTypeFreeGift'
  | 'ActionTypeFreeShipping'
  | 'ActionTypeFreeService'
  | 'ActionTypeFreeWarranty'
  | 'ActionTypeBundle';
/**
 * 已应用优惠券信息
 */
export interface CouponSchema {
  /**
   * 是否为自动应用
   */
  autoApplied: boolean;
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
   * 优惠券是否有效
   */
  isValid: boolean;
  /**
   * 优惠券类型（后端逐步补充）
   */
  actions: {
    actionType: PromotionActionType;
    amount: string;
  }[];
  [property: string]: any;
}

// Product Discount, Order Discount, Free Gift, Free Shipping, Free Service, Mixed, Bundle Discount
export enum VoucherType {
  PRODUCT_DISCOUNT = 'Product Discount',
  ORDER_DISCOUNT = 'Order Discount',
  FREE_GIFT = 'Free Gift',
  FREE_SHIPPING = 'Free Shipping',
  FREE_SERVICE = 'Free Service',
  MIXED = 'Mixed',
  BUNDLE_DISCOUNT = 'Bundle Discount',
}
export interface CouponListSchema {
  code: string;
  content: CouponContentSchema;
  name: string;
  /**
   * 0: available, 1: unavailable, 2: expired, 3: used
   */
  state: number;
  version: string;
  voucherTime: VoucherTimeSchema;
  voucherType: VoucherType;
  [property: string]: any;
}

export interface CouponContentSchema {
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
  [property: string]: any;
}

export interface VoucherTimeSchema {
  endTime: string;
  startTime: string;
  [property: string]: any;
}

export interface GiftPoolSchema {
  actionId: string;
  /**
   * gift pool id
   */
  freeGiftId: string;
  /**
   * PromotionControlTypeUnknown = 0 ,PromotionControlTypeCampaign
   * =1,PromotionControlTypeCoupon = 2
   */
  controlType: number;
  /**
   * gift items
   */
  gifts: GiftPoolGiftItemSchema[];
  /**
   * is eligible
   */
  isEligible: boolean;
  /**
   * min spend requirement
   */
  minSpend: GiftPoolMinSpendSchema;
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
  [property: string]: any;
}

export interface GiftPoolGiftItemSchema {
  /**
   * gift pool id
   */
  freeGiftId?: string;
  /**
   * quantity
   */
  quantity: number;
  /**
   * stock
   */
  state?: boolean;
  /**
   * variant info
   */
  variantId: number;
  [property: string]: any;
}

export interface GiftPoolGiftItemWithVariantSchema extends GiftPoolGiftItemSchema {
  variant: GiftVariantDetailSchema;
}
export interface GiftPoolWithGiftsVariantSchema extends GiftPoolSchema {
  gifts: GiftPoolGiftItemWithVariantSchema[];
}

/**
 * min spend requirement
 */
export interface GiftPoolMinSpendSchema {
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
  [property: string]: any;
}

/**
 * 商品的价格总和
 */
export interface ItemTotalSchema {
  /**
   * actual subtotal
   */
  actualSubtotal: string;
  /**
   * original subtotal
   */
  originalSubtotal: string;
  [property: string]: any;
}

export interface PromotionItemSchema {
  /**
   * 促销动作ID
   */
  actionId: number;
  /**
   * 促销动作类型
   * 0: ActionTypeUnknown,1:ActionTypeProductDiscount,2:ActionTypeOrderDiscount ,3:ActionTypeFreeGift,4:ActionTypeFreeShipping,5:ActionTypeFreeService,6:ActionTypeFreeWarranty ,7:ActionTypeBundle
   */
  actions: {
    actionType: PromotionActionType;
    amount: string;
  }[];

  /**
   * discount
   */
  discount: string;
  /**
   * 促销描述
   */
  promotionDesc: string;
  /**
   * 促销ID
   */
  promotionID: number;
  /**
   * 促销名称
   */
  promotionName: string;
  totalDiscount: string;
  [property: string]: any;
}

/**
 * 服务费总和
 */
export interface ServiceAmountSchema {
  /**
   * service name
   */
  name: string;
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
   * map,key:service type,value: amount total
   */
  typeAmountMap: { [key: string]: TypeAmountMapSchema };
  [property: string]: any;
}

export interface TypeAmountMapSchema {
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
 * shippingFee
 */
export interface ShippingFeeSchema {
  /**
   * shipping fee total
   */
  actualTotal: string;
  /**
   * discount shipping fee total
   */
  discountTotal: string;
  /**
   * original shipping fee total
   */
  shipmentOriginalTotal: string;
  /**
   * shipment
   */
  shipments: ShipmentItemSchema[];
  [property: string]: any;
}

export interface ShipmentItemSchema {
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
  [property: string]: any;
}

/**
 * 税费总和
 */
export interface TaxSchema {
  /**
   * for us,ca
   */
  additionalTaxTotal: string;
  /**
   * for sg,au,uk
   */
  includedTaxTotal: string;
  [property: string]: any;
}

/**
 * 保修费总和
 */
export interface WarrantyTotalSchema {
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
  [property: string]: any;
}

/**
 * 购物车商Zipcode 信息
 */
export interface ZipcodeSchema {
  /**
   * city
   */
  city: string;
  /**
   * state
   */
  countryState: string;
  /**
   * zipcode
   */
  zipcode: string;
  [property: string]: any;
}
