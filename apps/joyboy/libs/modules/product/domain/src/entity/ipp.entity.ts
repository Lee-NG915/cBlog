/**
 * 分期付款选项
 */
export interface IppOption {
  /** 最小金额（字符串格式） */
  min_amount: string;
  /** 分期期数（月） */
  period: number;
}

/**
 * 银行分期付款信息
 */
export interface IppBankOption {
  /** 银行名称 */
  bank: string;
  /** 银行代码 */
  bank_code: string;
  /** 银行卡号前缀数组（BIN码） */
  bins: string[];
  /** 分期付款选项列表 */
  options: IppOption[];
  /** 条款链接 */
  terms_url: string;
}

/**
 * 分期付款响应数据
 */
export interface IppResponse {
  /** 支付方式ID */
  payment_method_id: number;
  /** 银行分期付款选项列表 */
  ipp_options: IppBankOption[];
}

/**
 * 分期付款请求参数（如果需要的话）
 */
export interface IppRequest {
  /** 订单金额 */
  amount?: string;
  /** 货币类型 */
  currency?: string;
  /** 国家代码 */
  country?: string;
}

/**
 * 银行代码枚举
 */
export enum BankCode {
  DBS = 'dbs',
  OCBC = 'OCBC',
  UOB = 'UOB',
  AMEX = 'AMEX',
}

/**
 * 常用分期期数枚举
 */
export enum IppPeriod {
  THREE_MONTHS = 3,
  SIX_MONTHS = 6,
  TWELVE_MONTHS = 12,
  TWENTY_FOUR_MONTHS = 24,
}
