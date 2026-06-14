// =============================================================================
// Microsoft API Guidelines 标准响应格式
// =============================================================================

/**
 * Microsoft API Guidelines 错误对象
 * 根据 https://github.com/microsoft/api-guidelines 规范
 */
export interface ApiError {
  /** 语言无关的错误代码，服务定义的错误代码 */
  code: string;
  /** 人类可读的错误描述，面向开发者 */
  message: string;
  /** 错误的目标对象（可选，如字段名） */
  target?: string;
  /** 更详细的错误信息数组（可选） */
  details?: ApiError[];
  /** 更具体的内部错误信息（可选） */
  innerError?: {
    code?: string;
    innerError?: any;
    [key: string]: any;
  };
}

/**
 * Microsoft API Guidelines 错误响应格式
 */
export interface ApiErrorResponse {
  /** 错误对象 */
  error: ApiError;
}

/**
 * 统一的 API 集合响应格式
 * 用于返回多个资源的集合
 */
export interface ApiListResponse<T = any> {
  /** 响应数据数组 */
  value: T;
  /** 可选的下一页链接（分页场景） */
  '@nextLink'?: string;
  /** 可选的总数（计数场景） */
  '@count'?: number;
}

/**
 * 分页响应的通用接口
 */
export interface ApiPagedResponse<T = any> extends ApiListResponse<T[]> {
  '@nextLink'?: string;
  '@count'?: number;
}

export type SaleType = 'regular' | 'seo' | 'visual' | 'visual-seo';

export interface DeliverBefore {
  deadline: string;
  filter_presentation: string;
  _uid: string;
  component?: string;
  [k: string]: any;
}

export interface SaleInfo {
  uuid: string;
  url: string;
  outdatedUrls: string[];
  type: SaleType;
  query_deliver_before?: DeliverBefore[];
}
