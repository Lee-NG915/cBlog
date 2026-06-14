export type Currency = 'USD' | 'SGD' | 'AUD' | 'CAD' | 'GBP';

export type AddToCartSource = 'pdp' | 'plp' | 'recommendation';

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  currency: Currency;
}

export interface OrderLineItem {
  sku: string;
  quantity: number;
  price: number;
}

export interface OrderSummary {
  value: number;
  currency: Currency;
}

export interface Order {
  id: string;
  number: string;
  summary: OrderSummary;
  items: OrderLineItem[];
}

export interface ConsentState {
  marketing: boolean;
}
