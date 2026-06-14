/**
 * PaymentConfigsResp
 */
export interface PaymentConfigsResponseSchema {
  /**
   * 支付配置列表，每个元素包含provider和对应的配置
   */
  configs?: ProviderConfigSchema[];
  [property: string]: any;
}

/**
 * ProviderConfig
 */
export interface ProviderConfigSchema {
  affirmPublicKey?: AffirmPublicKeyConfig;
  /**
   * 是否自动填充响应码
   */
  autoResponseCode?: boolean;
  /**
   * 支付配置ID
   */
  id: number;
  instalmentOptions?: InstalmentOptionsConfig;
  /**
   * 支付方式名称
   */
  name?: string;
  paypalConfig?: PaypalConfig;
  /**
   * 支付提供商（唯一标识，支持的provider包括：2c2p, grabpay, zippay, affirm, hoolah, braintree, stripe-online,
   * stripe-afterpay, stripe-affirm, stripe-klarna, stripe-payment-link, stripe-apple-pay,
   * stripe-google-pay, stripe-terminal, stripe-invoice, stripe-offline, paypal-online,
   * paypal-invoice, offline-cash, offline-credit-card, offline-transfer,
   * offline-store-credit, offline-credit-memo, offline-cheque, nets, shopback,
   * offline-amex-term, offline-ocbc-term, offline-dbs-term, offline-sc-term, hoolah-v2,
   * grabpay-pos, hoolah-qr, legacy-payment-method）
   */
  provider: string;
  /**
   * 响应码提示文本（如"Appr Code"、"PayPal Transaction ID"）
   */
  responseCodeHint?: string;
  /**
   * 是否需要响应码（用于判断是否需要输入external_reference）
   */
  responseCodeRequired?: boolean;
  stripePublicKey?: StripePublicKeyConfig;
  stripeTerminalConnectionToken?: StripeTerminalConnectionTokenConfig;
  [property: string]: any;
}

/**
 * AffirmPublicKeyConfig
 */
export interface AffirmPublicKeyConfig {
  /**
   * 用于前端/SDK 初始化的公开公钥
   */
  publicApiKey: string;
  [property: string]: any;
}

/**
 * InstalmentOptionsConfig
 */
export interface InstalmentOptionsConfig {
  /**
   * 明确定义结构的列表
   */
  ippOptions: InstalmentBankOption[];
  [property: string]: any;
}

/**
 * InstalmentBankOption
 */
export interface InstalmentBankOption {
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
  options: InstalmentBankOptionTerm[];
  /**
   * 分期条款链接
   */
  termsUrl: string;
  [property: string]: any;
}

/**
 * InstalmentBankOptionTerm
 */
export interface InstalmentBankOptionTerm {
  /**
   * 最低消费金额，字符串金额
   */
  minAmount: string;
  /**
   * 分期期数（例如：3、6、12）
   */
  period: number;
  [property: string]: any;
}

/**
 * PaypalConfig
 */
export interface PaypalConfig {
  /**
   * 前端/SDK 初始化使用的客户端ID
   */
  clientId: string;
  [property: string]: any;
}

/**
 * StripePublicKeyConfig
 */
export interface StripePublicKeyConfig {
  /**
   * 用于前端/SDK 初始化的公开公钥
   */
  publicApiKey: string;
  [property: string]: any;
}

/**
 * StripeTerminalConnectionTokenConfig
 */
export interface StripeTerminalConnectionTokenConfig {
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
  [property: string]: any;
}

export interface IPlaceOrderSuccess<T = unknown> {
  status: 'success';
  data?: T;
}

export interface IPlaceOrderError {
  status: 'error';
  errorMessage: string;
  failureCode?: string;
  failureInfo?: string;
  /**
   * HTTP status code from the backend API response.
   * Used by classifyPaymentError to distinguish 4xx (client) from 5xx (server) errors.
   */
  httpStatus?: number;
}

/** @deprecated Use IPlaceOrderSuccess | IPlaceOrderError instead */
export interface IPaymentProcessingResult {
  status: 'success' | 'error';
  errorMessage: string;
  failureCode?: string;
  failureInfo?: string;
}

export interface IPaymentProcessingError {
  code: string;
  message: string;
}
