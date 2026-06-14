export interface PaymentMethodConfigs_V2 {
  affirmPublicKey?: {
    publicApiKey: string /** 用于前端/SDK 初始化的公开公钥 */;
  };
  paypalPublicKey?: {
    publicApiKey: string /** 客户端初始化所需的一次性令牌 */;
  };
  instalmentOptions?: {
    ippOptions: InstalmentIppOption_V2[];
  };
  stripePublicKey?: {
    publicApiKey: string /** 用于前端/SDK 初始化的公开公钥 */;
  };
  stripeTerminalConnectionToken?: StripeTerminalConnectionToken_V2;
  [property: string]: any;
}

export interface InstalmentIppOption_V2 {
  /**
   * 银行名称
   */
  bank: string;
  /**
   * 银行代码
   */
  bankCode: string;
  /**
   * 支持的 BIN 列表
   */
  bins: string[];
  /**
   * 期数与门槛
   */
  options: {
    /**
     * 最低消费金额，字符串金额
     */
    minAmount: string;
    /**
     * 分期期数（例如：3、6、12）
     */
    period: number;
  }[];
  /**
   * 分期条款链接
   */
  termsUrl: string;
}

export interface StripeTerminalConnectionToken_V2 {
  /**
   * 创建时间（Unix 秒）
   */
  created?: number;
  /**
   * 过期时间（Unix 秒）
   */
  expiresAt?: number;
  /**
   * 是否生产模式
   */
  livemode?: boolean;
  /**
   * 可选：关联的门店/地点 ID
   */
  location?: string;
  /**
   * 对象类型标识
   */
  object?: string;
  /**
   * 用于在终端 SDK 建立连接的 token
   */
  secret: string;
}

// shared/types/module-list.entity.ts

/** 模块枚举 */
export enum PaymentModuleType_V2 {
  StripePublicKey = 1,
  AffirmPublicKey = 2,
  BraintreeClientToken = 3,
  InstalmentOptions = 4,
  StripeTerminalConnectionToken = 5,
}

export enum PaymentModuleSettingsKeys_V2 {
  StripePublicKey = 'stripePublicKey',
  AffirmPublicKey = 'affirmPublicKey',
  PaypalPublicKey = 'paypalPublicKey',
  InstalmentOptions = 'instalmentOptions',
  StripeTerminalConnectionToken = 'stripeTerminalConnectionToken',
}

/** 模块值的类型映射 */
export interface PaymentModuleValueMap_V2 {
  [ModuleType.StripePublicKey]: string;
  [ModuleType.AffirmPublicKey]: string;
  [ModuleType.BraintreeClientToken]: string;
  [ModuleType.InstalmentOptions]: string;
  [ModuleType.StripeTerminalConnectionToken]: string;
}

export interface PosPaymentProviderConfigV2 {
  affirmPublicKey?: {
    publicApiKey: string;
  };
  autoResponseCode?: boolean;
  id: string;
  instalmentOptions?: {
    ippOptions: {
      bank: string;
      bankCode: string;
      bins: string[];
      options: {
        minAmount: string;
        period: number;
      }[];
      termsUrl: string;
    }[];
  };
  name?: string;
  paypalConfig?: {
    clientId: string;
  };
  provider: string;
  responseCodeHint?: string;
  responseCodeRequired?: boolean;
  stripePublicKey?: {
    publicApiKey: string;
  };
  stripeTerminalConnectionToken?: {
    created?: number;
    expiresAt?: number;
    livemode?: boolean;
    location?: string;
    object?: string;
    secret: string;
  };
  [property: string]: any;
}

export interface PosPaymentConfigsResponse {
  configs?: PosPaymentProviderConfigV2[];
  [property: string]: any;
}

/**
 * PosPaymentData
 *
 * @link https://app.apifox.com/project/7031354/apis/api-378896752
 */
export interface PosPaymentData {
  /**
   * 支付信息列表
   */
  payments?: OrderPaymentV1[];
  [property: string]: any;
}

export type PaymentStatusSchema =
  | 'PAYMENT_STATUS_UNSPECIFIED'
  | 'PAYMENT_STATUS_PENDING'
  | 'PAYMENT_STATUS_AUTHORIZED'
  | 'PAYMENT_STATUS_CAPTURED'
  | 'PAYMENT_STATUS_FAILED'
  | 'PAYMENT_STATUS_CANCELED'
  | 'PAYMENT_STATUS_REFUNDED'
  | 'PAYMENT_STATUS_PAID'
  | 'PAYMENT_STATUS_PROCESSING'
  | 'PAYMENT_STATUS_EXPIRED'
  | 'PAYMENT_STATUS_VOIDED';

export interface OrderPaymentV1 {
  /**
   * 支付提供商名称
   */
  paymentMethodName: string;
  /**
   * 支付金额
   */
  amount: string;
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 支付记录ID
   */
  id: string;
  /**
   * 是否作废
   */
  isVoided: boolean;
  /**
   * 订单ID
   */
  orderId: string;
  /**
   * 支付描述
   */
  paymentDescription: string;
  /**
   * 支付结束时间
   */
  paymentEndAt: string;
  /**
   * 支付系统的支付ID
   */
  paymentId: string;
  /**
   * 支付方式
   */
  paymentMethod: string;
  /**
   * 支付数据
   */
  paymentPayload: PosPaymentPayload;
  /**
   * 支付结果
   */
  paymentResult: PosPaymentResult;
  /**
   * 支付开始时间
   */
  paymentStartAt: string;
  /**
   * 支付状态
   * PAYMENT_STATUS_UNSPECIFIED, PAYMENT_STATUS_PENDING, PAYMENT_STATUS_AUTHORIZED, PAYMENT_STATUS_CAPTURED, PAYMENT_STATUS_FAILED, PAYMENT_STATUS_CANCELED, PAYMENT_STATUS_REFUNDED, PAYMENT_STATUS_PAID, PAYMENT_STATUS_PROCESSING, PAYMENT_STATUS_EXPIRED, PAYMENT_STATUS_VOIDED
   */
  paymentState: PaymentStatusSchema;

  /**
   * 支付交易ID
   */
  paymentTransactionId: string;
  /**
   * 更新时间
   */
  updatedAt: string;

  /**
   * provider
   * 支付提供商唯一标识
   * 可选值：2c2p, grabpay, zippay, affirm, hoolah, braintree, stripe-online, stripe-afterpay, stripe-affirm, stripe-klarna, stripe-payment-link, stripe-apple-pay, stripe-google-pay,
   *  stripe-terminal, stripe-invoice, stripe-offline, paypal-online, paypal-invoice, offline-cash, offline-credit-card, offline-transfer, offline-store-credit, offline-credit-memo, offline-cheque,
   *  nets, shopback, offline-amex-term, offline-ocbc-term, offline-dbs-term,offline-sc-term, hoolah-v2, grabpay-pos, hoolah-qr, legacy-payment-method
   */
  provider:
    | '2c2p'
    | 'grabpay'
    | 'zippay'
    | 'affirm'
    | 'hoolah'
    | 'braintree'
    | 'stripe-online'
    | 'stripe-afterpay'
    | 'stripe-affirm'
    | 'stripe-klarna'
    | 'stripe-payment-link'
    | 'stripe-apple-pay'
    | 'stripe-google-pay'
    | 'stripe-terminal'
    | 'stripe-invoice'
    | 'stripe-offline'
    | 'paypal-online'
    | 'paypal-invoice'
    | 'offline-cash'
    | 'offline-credit-card'
    | 'offline-transfer'
    | 'offline-store-credit'
    | 'offline-credit-memo'
    | 'offline-cheque'
    | 'nets'
    | 'shopback'
    | 'offline-amex-term'
    | 'offline-ocbc-term'
    | 'offline-dbs-term'
    | 'offline-sc-term'
    | 'hoolah-v2'
    | 'grabpay-pos'
    | 'hoolah-qr'
    | 'legacy-payment-method';
}

/**
 * 支付数据
 */
export interface PosPaymentPayload {
  /**
   * 支付金额
   */
  amount: string;
  /**
   * 支付方式
   */
  paymentMethod: string;
  /**
   * 支付时间
   */
  paymentTime: string;
  /**
   * 支付状态
   */
  status: string;
  [property: string]: any;
}

/**
 * 支付结果
 */
export interface PosPaymentResult {
  /**
   * 卡品牌
   */
  cardBrand: string;
  /**
   * 卡过期月份
   */
  cardExpMonth: number;
  /**
   * 卡过期年份
   */
  cardExpYear: number;
  /**
   * 卡后四位
   */
  cardLast4: string;
  /**
   * 响应代码
   */
  code: string;
  /**
   * 响应消息
   */
  message: string;
  [property: string]: any;
}

/**
 * PosPaymentInitiateReq
 */
export interface PosPaymentInitiatePayload {
  /**
   * 支付金额
   */
  amount: string;
  /**
   * 货币代码
   */
  currency?: string;
  /**
   * 支付描述
   */
  description?: string;
  /**
   * 响应码/交易号（仅离线支付需要，当response_code_required=true时必填）
   */
  externalReference?: string;
  /**
   * 订单编号
   */
  orderNumber: string;
  /**
   * 订单ID
   */
  orderId?: string;
  /**
   * Stripe Payment Intent ID（仅Stripe Terminal支付需要）
   */
  paymentIntentId?: string;
  /**
   * 支付提供商（如：offline-cash, stripe-terminal等，provider唯一确认支付方式）
   */
  provider: string;
  /**
   * 备注（仅离线支付需要）
   */
  remarks?: string;
  /**
   * 幂等性键值，用于防止重复支付
   */
  idempotencyKey?: string;
}
