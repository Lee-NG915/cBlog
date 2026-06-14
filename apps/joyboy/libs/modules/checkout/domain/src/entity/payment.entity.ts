export interface PayMethod {
  id: number;
  name: string;
  response_code_required: boolean;
  auto_response_code: boolean;
  response_code_hint: string;
  payment_types?: string[];
  description?: string;
}

export interface OfflinePaymentSource {
  id: number;
  payment_type: string;
  remarks: string;
  card_brand?: string;
  masked_pan?: string;
}
export interface UpdateOrderForStripeLinkPayRequest {
  number: string;
  special_instructions: string; //没有即空字符串‘’
  exchange_order_number: string; //没有即空字符串‘’
  assembly_preferences: string[]; //来源自order的selected_assembly_preferences?[n].slug
  trade_partner_id: string | number; //没有即空字符串‘’
}

export interface PaymentItem {
  id: number;
  state: string;
  number: string;
  amount: string;
  created_at: string;
  updated_at: string;
  offline_payment_source: OfflinePaymentSource;
  payment_method: PaymentMethod;
}

export interface PaymentMethod {
  id: number;
  name: string;
  payment_types: string[];
  response_code_required: boolean;
  auto_response_code: boolean;
  response_code_hint: string;
  description?: string;
}

/**
 * OrderPaymentsResponse
 */
export interface OrderPaymentsResponse {
  /**
   * payment info list
   */
  payments: OrderPayment[];
  [property: string]: any;
}

/**
 * Payment
 */
export interface OrderPayment {
  /**
   * price
   */
  amount: string;
  /**
   * payment created at
   */
  createdAt: string;
  /**
   * payment id
   */
  id: string;
  /**
   * payment method
   */
  method: string;
  paymentDisplay?: OrderPaymentDisplay;
  /**
   * payment state
   */
  state: string;
  /**
   * payment transaction id
   */
  transactionId: string;
  [property: string]: any;
}

/**
 * PaymentDisplay
 */
export interface OrderPaymentDisplay {
  stripeCreditCard?: OrderPaymentStripeCreditCardDisplay;
  [property: string]: any;
}

/**
 * StripeCreditCardDisplay
 */
export interface OrderPaymentStripeCreditCardDisplay {
  /**
   * card brand
   */
  cardBrand: string;
  /**
   * card expiration month
   */
  cardExpMonth: number;
  /**
   * card expiration year
   */
  cardExpYear: number;
  /**
   * card last 4 digits
   */
  cardLast4: string;
  /**
   * external reference
   */
  externalReference: string;
  /**
   * payment intent id
   */
  intent: string;
  [property: string]: any;
}
