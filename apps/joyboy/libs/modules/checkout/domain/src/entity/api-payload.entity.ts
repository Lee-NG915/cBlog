import type { Order } from '@castlery/types';

export interface prePayCheckApiPayload {
  number: string;
}

export interface AddPayMethodsApiPayload extends Pick<Order, 'number'> {
  payments_attributes: {
    payment_method_id: number;
    source_attributes: {
      payment_type: string;
      remarks: string;
      payment_intent_id?: string;
      card_brand?: string;
      card_entry_method?: string;
      expiration_date?: string;
      masked_pan?: string;
      external_reference?: string;
    };
    amount: number;
  };
}
